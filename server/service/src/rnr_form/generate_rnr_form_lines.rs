use std::{collections::HashMap, ops::Neg};

use chrono::{Duration, NaiveDate};
use repository::{
    AdjustmentFilter, AdjustmentRepository, ConsumptionFilter, ConsumptionRepository, DateFilter,
    DatetimeFilter, EqualFilter, MasterListLineFilter, MasterListLineRepository, Pagination,
    PeriodRow, ReplenishmentFilter, ReplenishmentRepository, RepositoryError, RnRForm,
    RnRFormLineRow, RnRFormLineRowRepository, StockLineFilter, StockLineRepository, StockLineSort,
    StockLineSortField, StockMovementFilter, StockMovementRepository, StockOnHandFilter,
    StockOnHandRepository, StorageConnection,
};
use util::{constants::NUMBER_OF_DAYS_IN_A_MONTH, date_now, date_with_offset, uuid::uuid};

use crate::{
    requisition_line::chart::{get_stock_evolution_for_item, StockEvolutionOptions},
    service_provider::ServiceContext,
};

// Would be nice if this was an OMS store pref
const TARGET_MOS: f64 = 2.0;

pub fn generate_rnr_form_lines(
    ctx: &ServiceContext,
    store_id: &str,
    rnr_form_id: &str,
    master_list_id: &str,
    period: PeriodRow,
    previous_form: Option<RnRForm>,
) -> Result<Vec<RnRFormLineRow>, RepositoryError> {
    let master_list_item_ids = get_master_list_item_ids(&ctx, master_list_id)?;

    let period_length_in_days = get_period_length(&period);
    let lookback_months = period_length_in_days as f64 / NUMBER_OF_DAYS_IN_A_MONTH;

    // Get consumption/replenishment/adjustment stats for each item in the master list
    let usage_by_item_map = get_usage_map(
        &ctx.connection,
        store_id,
        Some(EqualFilter::equal_any(master_list_item_ids.clone())),
        period_length_in_days,
        &period.end_date,
    )?;

    // Get previous form data for initial balances
    let previous_rnr_form_lines_by_item_id =
        get_last_rnr_form_lines(&ctx.connection, previous_form.map(|f| f.rnr_form_row.id))?;

    let rnr_form_lines = master_list_item_ids
        .into_iter()
        .map(|item_id| {
            let initial_balance = get_opening_balance(
                &ctx.connection,
                previous_rnr_form_lines_by_item_id.get(&item_id),
                store_id,
                &item_id,
                period.start_date,
            )?;

            let usage = usage_by_item_map.get(&item_id).copied().unwrap_or_default();

            let final_balance =
                initial_balance + usage.replenished - usage.consumed + usage.adjusted;

            let stock_out_duration = get_stock_out_duration(
                &ctx.connection,
                store_id,
                &item_id,
                period.end_date,
                period_length_in_days as u32,
                final_balance,
            )?;

            let adjusted_quantity_consumed = get_adjusted_quantity_consumed(
                period_length_in_days,
                stock_out_duration as i64,
                usage.consumed,
            );

            // This is only AMC for this period (if periods are monthly, this is redundant...)
            // Should it be the default we have elsewhere... 3 months lookback?
            let amc = usage.consumed / lookback_months;

            let maximum_quantity = amc * TARGET_MOS;

            let requested_quantity = if maximum_quantity - final_balance > 0.0 {
                maximum_quantity - final_balance
            } else {
                0.0
            };

            let earliest_expiry = get_earliest_expiry(&ctx.connection, store_id, &item_id)?;

            Ok(RnRFormLineRow {
                id: uuid(),
                rnr_form_id: rnr_form_id.to_string(),
                item_id,
                average_monthly_consumption: amc,
                initial_balance,
                quantity_received: usage.replenished,
                quantity_consumed: usage.consumed,
                stock_out_duration,
                adjustments: usage.adjusted,

                adjusted_quantity_consumed,
                final_balance,
                maximum_quantity,
                expiry_date: earliest_expiry,
                requested_quantity,
                comment: None,
                confirmed: false,
            })
        })
        .collect::<Result<Vec<RnRFormLineRow>, RepositoryError>>();

    rnr_form_lines
}

fn get_master_list_item_ids(
    ctx: &ServiceContext,
    master_list_id: &str,
) -> Result<Vec<String>, RepositoryError> {
    MasterListLineRepository::new(&ctx.connection)
        .query_by_filter(
            MasterListLineFilter::new().master_list_id(EqualFilter::equal_to(master_list_id)),
        )
        .map(|lines| lines.into_iter().map(|line| line.item_id).collect())
}

fn get_last_rnr_form_lines(
    connection: &StorageConnection,
    previous_form_id: Option<String>,
) -> Result<HashMap<String, RnRFormLineRow>, RepositoryError> {
    let mut form_lines_by_item_id = HashMap::new();

    if let Some(previous_form_id) = previous_form_id {
        let rows = RnRFormLineRowRepository::new(connection)
            .find_many_by_rnr_form_id(&previous_form_id)?;

        for row in rows.into_iter() {
            form_lines_by_item_id.insert(row.item_id.clone(), row);
        }
    }

    Ok(form_lines_by_item_id)
}

pub fn get_opening_balance(
    connection: &StorageConnection,
    previous_row: Option<&RnRFormLineRow>,
    store_id: &str,
    item_id: &str,
    start_date: NaiveDate,
) -> Result<f64, RepositoryError> {
    if let Some(previous_row) = previous_row {
        return Ok(previous_row.final_balance);
    }

   /*
   Find all the store movement values between the start_date and now
   Take those stock movements away from the current stock on hand, to retrospectively calculate what was available at that time.
   */
    let filter = StockMovementFilter::new()
        .store_id(EqualFilter::equal_to(store_id))
        .item_id(EqualFilter::equal_to(item_id))
        .datetime(DatetimeFilter::date_range(
            start_date.into(),
            date_now().into(),
        ));

    let stock_movement_rows = StockMovementRepository::new(connection).query(Some(filter))?;

    let total_movements: f64 = stock_movement_rows
        .into_iter()
        .map(|row| row.quantity)
        .sum();

    let available_stock_on_hand = StockOnHandRepository::new(connection)
        .query_one(
            StockOnHandFilter::new()
                .store_id(EqualFilter::equal_to(store_id))
                .item_id(EqualFilter::equal_to(item_id)),
        )?
        .map(|row| row.available_stock_on_hand)
        .unwrap_or(0.0);

    Ok(available_stock_on_hand - total_movements)
}

pub fn get_stock_out_duration(
    connection: &StorageConnection,
    store_id: &str,
    item_id: &str,
    end_date: NaiveDate,
    days_in_period: u32,
    closing_quantity: f64,
) -> Result<i32, RepositoryError> {
    let end_datetime = end_date
        .and_hms_milli_opt(23, 59, 59, 999)
        // Should always be able to create end of day datetime, so this error shouldn't be possible
        .ok_or(RepositoryError::as_db_error(
            "Could not determine closing datetime",
            "",
        ))?;

    let evolution = get_stock_evolution_for_item(
        connection,
        store_id,
        item_id,
        end_datetime,
        closing_quantity as u32,
        date_now(), // only used for future projections, not needed here
        0,          // only used for future projections, not needed here
        0.0,        // only used for future projections, not needed here
        StockEvolutionOptions {
            number_of_historic_data_points: days_in_period,
            number_of_projected_data_points: 0,
        },
    )?;

    let days_out_of_stock = evolution
        .historic_stock
        .into_iter()
        .filter(|point| point.quantity == 0.0)
        .count();

    Ok(days_out_of_stock as i32)
}

pub fn get_adjusted_quantity_consumed(
    period_length_in_days: i64,
    stock_out_duration: i64,
    consumed: f64,
) -> f64 {
    let days_in_stock = period_length_in_days - stock_out_duration;

    let adjusted_quantity_consumed = match days_in_stock {
        0 => 0.0,
        days_in_stock => consumed * period_length_in_days as f64 / days_in_stock as f64,
    };

    adjusted_quantity_consumed
}

#[derive(Debug, PartialEq, Default, Copy, Clone)]
pub struct UsageStats {
    pub consumed: f64,
    pub replenished: f64,
    pub adjusted: f64,
}

pub fn get_usage_map(
    connection: &StorageConnection,
    store_id: &str,
    item_id_filter: Option<EqualFilter<String>>,
    period_length_in_days: i64,
    end_date: &NaiveDate,
) -> Result<HashMap<String, UsageStats>, RepositoryError> {
    let lookback_days = period_length_in_days - 1; // period length is inclusive

    let start_date = date_with_offset(end_date, Duration::days(lookback_days).neg());
    let store_id_filter = Some(EqualFilter::equal_to(store_id));
    let date_filter = Some(DateFilter::date_range(&start_date, end_date));

    let consumption_rows =
        ConsumptionRepository::new(connection).query(Some(ConsumptionFilter {
            item_id: item_id_filter.clone(),
            store_id: store_id_filter.clone(),
            date: date_filter.clone(),
        }))?;
    let replenishment_rows =
        ReplenishmentRepository::new(connection).query(Some(ReplenishmentFilter {
            item_id: item_id_filter.clone(),
            store_id: store_id_filter.clone(),
            date: date_filter.clone(),
        }))?;
    let adjustment_rows = AdjustmentRepository::new(connection).query(Some(AdjustmentFilter {
        item_id: item_id_filter,
        store_id: store_id_filter,
        date: date_filter,
    }))?;

    let mut usage_map = HashMap::new();

    for consumption_row in consumption_rows.into_iter() {
        let item = usage_map
            .entry(consumption_row.item_id.clone())
            .or_insert(UsageStats::default());
        item.consumed += consumption_row.quantity;
    }
    for replenishment_row in replenishment_rows.into_iter() {
        let item = usage_map
            .entry(replenishment_row.item_id.clone())
            .or_insert(UsageStats::default());
        item.replenished += replenishment_row.quantity;
    }
    for adjustment_row in adjustment_rows.into_iter() {
        let item = usage_map
            .entry(adjustment_row.item_id.clone())
            .or_insert(UsageStats::default());
        item.adjusted += adjustment_row.quantity;
    }

    Ok(usage_map)
}

pub fn get_earliest_expiry(
    connection: &StorageConnection,
    store_id: &str,
    item_id: &str,
) -> Result<Option<NaiveDate>, RepositoryError> {
    let filter = StockLineFilter::new()
        .store_id(EqualFilter::equal_to(store_id))
        .item_id(EqualFilter::equal_to(item_id))
        // TODO: this is available stock _now_, but not what would have been available at the closing time of the period!
        // Also, should it be available or in store?
        .is_available(true);

    let earliest_expiring = StockLineRepository::new(connection)
        .query(
            Pagination::all(),
            Some(filter),
            Some(StockLineSort {
                key: StockLineSortField::ExpiryDate,
                // Descending, then pop last entry for earliest expiry
                desc: Some(true),
            }),
            Some(store_id.to_string()),
        )?
        .pop();

    Ok(earliest_expiring
        .map(|line| line.stock_line_row.expiry_date)
        .flatten())
}

fn get_period_length(period: &PeriodRow) -> i64 {
    period
        .end_date
        .signed_duration_since(period.start_date)
        .num_days()
        + 1 // To be inclusive of end date
}
