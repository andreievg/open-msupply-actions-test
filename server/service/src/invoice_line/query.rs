use crate::SingleRecordError;
use domain::{
    invoice_line::{InvoiceLine, InvoiceLineFilter},
    EqualFilter, Pagination,
};
use repository::{InvoiceLineRepository, StorageConnectionManager};

pub const MAX_LIMIT: u32 = 1000;
pub const MIN_LIMIT: u32 = 1;

pub fn get_invoice_line(
    connection_manager: &StorageConnectionManager,
    id: String,
) -> Result<InvoiceLine, SingleRecordError> {
    let connection = connection_manager.connection()?;

    let mut result = InvoiceLineRepository::new(&connection).query(
        Pagination::one(),
        Some(InvoiceLineFilter::new().id(EqualFilter::equal_to(&id))),
        None,
    )?;

    if let Some(record) = result.pop() {
        Ok(record)
    } else {
        Err(SingleRecordError::NotFound(id))
    }
}
