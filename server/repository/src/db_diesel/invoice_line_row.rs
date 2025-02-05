use super::{
    inventory_adjustment_reason_row::inventory_adjustment_reason,
    invoice_line_row::invoice_line::dsl::*, invoice_row::invoice, item_row::item,
    location_row::location, stock_line_row::stock_line, StorageConnection,
};

use crate::repository_error::RepositoryError;

use diesel::prelude::*;

use chrono::NaiveDate;
use diesel_derive_enum::DbEnum;

table! {
    invoice_line (id) {
        id -> Text,
        invoice_id -> Text,
        item_id -> Text,
        item_name -> Text,
        item_code -> Text,
        stock_line_id -> Nullable<Text>,
        location_id -> Nullable<Text>,
        batch -> Nullable<Text>,
        expiry_date -> Nullable<Date>,
        pack_size -> Integer,
        cost_price_per_pack -> Double,
        sell_price_per_pack -> Double,
        total_before_tax -> Double,
        total_after_tax -> Double,
        tax -> Nullable<Double>,
        #[sql_name = "type"] type_ -> crate::db_diesel::invoice_line_row::InvoiceLineRowTypeMapping,
        number_of_packs -> Double,
        note -> Nullable<Text>,
        inventory_adjustment_reason_id -> Nullable<Text>,
    }
}

joinable!(invoice_line -> item (item_id));
joinable!(invoice_line -> stock_line (stock_line_id));
joinable!(invoice_line -> invoice (invoice_id));
joinable!(invoice_line -> location (location_id));
joinable!(invoice_line -> inventory_adjustment_reason (inventory_adjustment_reason_id));

#[derive(DbEnum, Debug, Clone, PartialEq, Eq)]
#[DbValueStyle = "SCREAMING_SNAKE_CASE"]
pub enum InvoiceLineRowType {
    StockIn,
    StockOut,
    UnallocatedStock,
    Service,
}

impl Default for InvoiceLineRowType {
    fn default() -> Self {
        Self::StockIn
    }
}

#[derive(Clone, Queryable, Insertable, AsChangeset, Debug, PartialEq, Default)]
#[changeset_options(treat_none_as_null = "true")]
#[table_name = "invoice_line"]
pub struct InvoiceLineRow {
    pub id: String,
    pub invoice_id: String,
    pub item_id: String,
    pub item_name: String,
    pub item_code: String,
    pub stock_line_id: Option<String>,
    pub location_id: Option<String>,
    pub batch: Option<String>,
    pub expiry_date: Option<NaiveDate>,
    pub pack_size: i32,
    pub cost_price_per_pack: f64,
    /// Sell price before tax
    pub sell_price_per_pack: f64,
    pub total_before_tax: f64,
    pub total_after_tax: f64,
    /// Optional column to store line a line specific tax value
    pub tax: Option<f64>,
    #[column_name = "type_"]
    pub r#type: InvoiceLineRowType,
    pub number_of_packs: f64,
    pub note: Option<String>,
    pub inventory_adjustment_reason_id: Option<String>,
}

pub struct InvoiceLineRowRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> InvoiceLineRowRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        InvoiceLineRowRepository { connection }
    }

    #[cfg(feature = "postgres")]
    pub fn upsert_one(&self, row: &InvoiceLineRow) -> Result<(), RepositoryError> {
        diesel::insert_into(invoice_line)
            .values(row)
            .on_conflict(id)
            .do_update()
            .set(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    #[cfg(not(feature = "postgres"))]
    pub fn upsert_one(&self, row: &InvoiceLineRow) -> Result<(), RepositoryError> {
        diesel::replace_into(invoice_line)
            .values(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    pub fn update_tax(
        &self,
        record_id: &str,
        tax_input: Option<f64>,
        total_after_tax_calculation: f64,
    ) -> Result<(), RepositoryError> {
        diesel::update(invoice_line)
            .filter(id.eq(record_id))
            .set((
                tax.eq(tax_input),
                total_after_tax.eq(total_after_tax_calculation),
            ))
            .execute(&self.connection.connection)?;
        Ok(())
    }

    pub fn delete(&self, invoice_line_id: &str) -> Result<(), RepositoryError> {
        diesel::delete(invoice_line.filter(id.eq(invoice_line_id)))
            .execute(&self.connection.connection)?;
        Ok(())
    }

    pub fn find_one_by_id(&self, record_id: &str) -> Result<InvoiceLineRow, RepositoryError> {
        let result = invoice_line
            .filter(id.eq(record_id))
            .first(&self.connection.connection);
        result.map_err(|err| RepositoryError::from(err))
    }

    pub fn find_many_by_id(&self, ids: &[String]) -> Result<Vec<InvoiceLineRow>, RepositoryError> {
        let result = invoice_line
            .filter(id.eq_any(ids))
            .load(&self.connection.connection)?;
        Ok(result)
    }

    // TODO replace find_one_by_id with this one
    pub fn find_one_by_id_option(
        &self,
        invoice_line_id: &str,
    ) -> Result<Option<InvoiceLineRow>, RepositoryError> {
        let result = invoice_line
            .filter(id.eq(invoice_line_id))
            .first(&self.connection.connection)
            .optional()?;
        Ok(result)
    }

    pub fn find_many_by_invoice_and_batch_id(
        &self,
        stock_line_id_param: &str,
        invoice_id_param: &str,
    ) -> Result<Vec<InvoiceLineRow>, RepositoryError> {
        Ok(invoice_line
            .filter(invoice_id.eq(invoice_id_param))
            .filter(stock_line_id.eq(stock_line_id_param))
            .load(&self.connection.connection)?)
    }

    pub fn find_many_by_invoice_id(
        &self,
        invoice_id_param: &str,
    ) -> Result<Vec<InvoiceLineRow>, RepositoryError> {
        let result = invoice_line
            .filter(invoice_id.eq(invoice_id_param))
            .get_results(&self.connection.connection)?;
        Ok(result)
    }
}
