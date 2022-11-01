use crate::invoice::{
    check_invoice_exists, check_invoice_is_editable, check_invoice_status, check_invoice_type,
    check_status_change, check_store, InvoiceDoesNotExist, InvoiceIsNotEditable,
    InvoiceRowStatusError, NotThisStoreInvoice, WrongInvoiceRowType,
};
use crate::validate::{check_other_party, CheckOtherPartyType, OtherPartyErrors};
use repository::{InvoiceRow, InvoiceRowType, Name, StorageConnection};

use super::{UpdateInboundShipment, UpdateInboundShipmentError};

pub fn validate(
    connection: &StorageConnection,
    store_id: &str,
    patch: &UpdateInboundShipment,
) -> Result<(InvoiceRow, Option<Name>, bool), UpdateInboundShipmentError> {
    use UpdateInboundShipmentError::*;
    let invoice = check_invoice_exists(&patch.id, connection)?;

    check_store(&invoice, store_id)?;
    check_invoice_type(&invoice, InvoiceRowType::InboundShipment)?;
    check_invoice_is_editable(&invoice)?;

    // Status check
    let status_changed = check_status_change(&invoice, patch.full_status());
    if status_changed {
        check_invoice_status(&invoice, patch.full_status(), &patch.on_hold)?;
    }

    // Other party check
    let other_party_id = match &patch.other_party_id {
        None => return Ok((invoice, None, status_changed)),
        Some(other_party_id) => other_party_id,
    };

    let other_party = check_other_party(
        connection,
        store_id,
        &other_party_id,
        CheckOtherPartyType::Supplier,
    )
    .map_err(|e| match e {
        OtherPartyErrors::OtherPartyDoesNotExist => OtherPartyDoesNotExist {},
        OtherPartyErrors::OtherPartyNotVisible => OtherPartyNotVisible,
        OtherPartyErrors::TypeMismatched => OtherPartyNotASupplier,
        OtherPartyErrors::DatabaseError(repository_error) => DatabaseError(repository_error),
    })?;

    Ok((invoice, Some(other_party), status_changed))
}

impl From<WrongInvoiceRowType> for UpdateInboundShipmentError {
    fn from(_: WrongInvoiceRowType) -> Self {
        UpdateInboundShipmentError::NotAnInboundShipment
    }
}

impl From<InvoiceIsNotEditable> for UpdateInboundShipmentError {
    fn from(_: InvoiceIsNotEditable) -> Self {
        UpdateInboundShipmentError::CannotEditFinalised
    }
}

impl From<InvoiceDoesNotExist> for UpdateInboundShipmentError {
    fn from(_: InvoiceDoesNotExist) -> Self {
        UpdateInboundShipmentError::InvoiceDoesNotExist
    }
}

impl From<NotThisStoreInvoice> for UpdateInboundShipmentError {
    fn from(_: NotThisStoreInvoice) -> Self {
        UpdateInboundShipmentError::NotThisStoreInvoice
    }
}

impl From<InvoiceRowStatusError> for UpdateInboundShipmentError {
    fn from(error: InvoiceRowStatusError) -> Self {
        use UpdateInboundShipmentError::*;
        match error {
            InvoiceRowStatusError::CannotChangeStatusOfInvoiceOnHold => {
                CannotChangeStatusOfInvoiceOnHold
            }
            InvoiceRowStatusError::CannotReverseInvoiceStatus => CannotReverseInvoiceStatus,
        }
    }
}
