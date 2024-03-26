use repository::{
    InvoiceLineRow, InvoiceLineRowType, InvoiceRow, InvoiceRowStatus, ItemRow, RepositoryError,
    StockLine, StockLineRow, StorageConnection,
};

use crate::invoice::common::{calculate_foreign_currency_total, calculate_total_after_tax};

use super::{InsertStockOutLine, InsertStockOutLineError};

pub fn generate(
    connection: &StorageConnection,
    input: InsertStockOutLine,
    item_row: ItemRow,
    batch: StockLine,
    invoice: InvoiceRow,
) -> Result<(InvoiceLineRow, StockLineRow), InsertStockOutLineError> {
    let adjust_total_number_of_packs = invoice.status == InvoiceRowStatus::Picked;

    let update_batch = generate_batch_update(
        &input,
        batch.stock_line_row.clone(),
        adjust_total_number_of_packs,
    );
    let new_line = generate_line(connection, input, item_row, batch, invoice)?;

    Ok((new_line, update_batch))
}

fn generate_batch_update(
    input: &InsertStockOutLine,
    batch: StockLineRow,
    adjust_total_number_of_packs: bool,
) -> StockLineRow {
    let mut update_batch = batch;

    let reduction = input.number_of_packs;

    update_batch.available_number_of_packs -= reduction;
    if adjust_total_number_of_packs {
        update_batch.total_number_of_packs -= reduction;
    }

    update_batch
}

fn generate_line(
    connection: &StorageConnection,
    InsertStockOutLine {
        id,
        r#type: _,
        invoice_id,
        item_id,
        stock_line_id,
        number_of_packs,
        total_before_tax,
        tax: _,
        note,
    }: InsertStockOutLine,
    ItemRow {
        name: item_name,
        code: item_code,
        ..
    }: ItemRow,
    StockLine {
        stock_line_row:
            StockLineRow {
                sell_price_per_pack,
                cost_price_per_pack,
                pack_size,
                batch,
                expiry_date,
                location_id,
                note: _,
                ..
            },
        ..
    }: StockLine,
    InvoiceRow {
        tax,
        currency_id,
        currency_rate,
        ..
    }: InvoiceRow,
) -> Result<InvoiceLineRow, RepositoryError> {
    let total_before_tax = total_before_tax.unwrap_or(cost_price_per_pack * number_of_packs);
    let total_after_tax = calculate_total_after_tax(total_before_tax, tax);
    let foreign_currency_price_before_tax = calculate_foreign_currency_total(
        connection,
        total_before_tax,
        &currency_id,
        &currency_rate,
    )?;

    Ok(InvoiceLineRow {
        id,
        invoice_id,
        item_link_id: item_id,
        location_id,
        pack_size,
        batch,
        expiry_date,
        sell_price_per_pack,
        cost_price_per_pack,
        r#type: InvoiceLineRowType::StockOut,
        number_of_packs,
        item_name,
        item_code,
        stock_line_id: Some(stock_line_id),
        total_before_tax,
        total_after_tax,
        tax,
        note,
        inventory_adjustment_reason_id: None,
        foreign_currency_price_before_tax,
    })
}
