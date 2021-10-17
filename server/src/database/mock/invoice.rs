use chrono::{NaiveDate, Utc};

use crate::database::schema::{InvoiceRow, InvoiceRowStatus, InvoiceRowType};

pub fn mock_customer_invoice_a() -> InvoiceRow {
    InvoiceRow {
        id: String::from("customer_invoice_a"),
        name_id: String::from("name_store_a"),
        store_id: String::from("store_b"),
        invoice_number: 1,
        r#type: InvoiceRowType::CustomerInvoice,
        status: InvoiceRowStatus::Draft,
        comment: Some(String::from("")),
        their_reference: Some(String::from("")),
        entry_datetime: NaiveDate::from_ymd(1970, 1, 1).and_hms_milli(12, 30, 0, 0),
        confirm_datetime: Some(Utc::now().naive_utc()),
        finalised_datetime: Some(Utc::now().naive_utc()),
    }
}

pub fn mock_customer_invoice_b() -> InvoiceRow {
    InvoiceRow {
        id: String::from("customer_invoice_b"),
        name_id: String::from("name_store_a"),
        store_id: String::from("store_c"),
        invoice_number: 3,
        r#type: InvoiceRowType::CustomerInvoice,
        status: InvoiceRowStatus::Draft,
        comment: Some(String::from("")),
        their_reference: Some(String::from("")),
        entry_datetime: NaiveDate::from_ymd(1970, 1, 2).and_hms_milli(15, 30, 0, 0),
        confirm_datetime: Some(Utc::now().naive_utc()),
        finalised_datetime: Some(Utc::now().naive_utc()),
    }
}

pub fn mock_customer_invoice_finalised() -> InvoiceRow {
    InvoiceRow {
        id: String::from("customer_invoice_finalised"),
        name_id: String::from("name_store_a"),
        store_id: String::from("store_c"),
        invoice_number: 3,
        r#type: InvoiceRowType::CustomerInvoice,
        status: InvoiceRowStatus::Finalised,
        comment: Some(String::from("")),
        their_reference: Some(String::from("")),
        entry_datetime: NaiveDate::from_ymd(1970, 1, 5).and_hms_milli(15, 30, 0, 0),
        confirm_datetime: Some(Utc::now().naive_utc()),
        finalised_datetime: Some(Utc::now().naive_utc()),
    }
}

pub fn mock_customer_invoice_no_lines() -> InvoiceRow {
    InvoiceRow {
        id: String::from("customer_invoice_no_lines"),
        name_id: String::from("name_store_a"),
        store_id: String::from("store_c"),
        invoice_number: 3,
        r#type: InvoiceRowType::CustomerInvoice,
        status: InvoiceRowStatus::Confirmed,
        comment: Some(String::from("")),
        their_reference: Some(String::from("")),
        entry_datetime: NaiveDate::from_ymd(1970, 1, 6).and_hms_milli(15, 30, 0, 0),
        confirm_datetime: Some(Utc::now().naive_utc()),
        finalised_datetime: Some(Utc::now().naive_utc()),
    }
}

pub fn mock_supplier_invoice_a() -> InvoiceRow {
    InvoiceRow {
        id: String::from("supplier_invoice_a"),
        name_id: String::from("name_store_b"),
        store_id: String::from("store_a"),
        invoice_number: 2,
        r#type: InvoiceRowType::SupplierInvoice,
        status: InvoiceRowStatus::Draft,
        comment: Some(String::from("")),
        their_reference: Some(String::from("")),
        entry_datetime: NaiveDate::from_ymd(1970, 1, 3).and_hms_milli(20, 30, 0, 0),
        confirm_datetime: Some(Utc::now().naive_utc()),
        finalised_datetime: Some(Utc::now().naive_utc()),
    }
}

pub fn mock_supplier_invoice_b() -> InvoiceRow {
    InvoiceRow {
        id: String::from("supplier_invoice_b"),
        name_id: String::from("name_store_c"),
        store_id: String::from("store_a"),
        invoice_number: 4,
        r#type: InvoiceRowType::SupplierInvoice,
        status: InvoiceRowStatus::Draft,
        comment: Some(String::from("")),
        their_reference: Some(String::from("")),
        entry_datetime: NaiveDate::from_ymd(1970, 1, 4).and_hms_milli(21, 30, 0, 0),
        confirm_datetime: Some(Utc::now().naive_utc()),
        finalised_datetime: Some(Utc::now().naive_utc()),
    }
}

pub fn mock_supplier_invoice_no_lines() -> InvoiceRow {
    InvoiceRow {
        id: String::from("supplier_invoice_no_lines"),
        name_id: String::from("name_store_c"),
        store_id: String::from("store_a"),
        invoice_number: 4,
        r#type: InvoiceRowType::SupplierInvoice,
        status: InvoiceRowStatus::Draft,
        comment: Some(String::from("")),
        their_reference: Some(String::from("")),
        entry_datetime: NaiveDate::from_ymd(1970, 1, 7).and_hms_milli(21, 30, 0, 0),
        confirm_datetime: Some(Utc::now().naive_utc()),
        finalised_datetime: Some(Utc::now().naive_utc()),
    }
}

pub fn mock_customer_invoices() -> Vec<InvoiceRow> {
    vec![
        mock_customer_invoice_a(),
        mock_customer_invoice_b(),
        mock_customer_invoice_finalised(),
        mock_customer_invoice_no_lines(),
    ]
}

pub fn mock_supplier_invoices() -> Vec<InvoiceRow> {
    vec![
        mock_supplier_invoice_a(),
        mock_supplier_invoice_b(),
        mock_supplier_invoice_no_lines(),
    ]
}

pub fn mock_invoices() -> Vec<InvoiceRow> {
    let mut mock_invoices: Vec<InvoiceRow> = Vec::new();

    mock_invoices.extend(mock_customer_invoices());
    mock_invoices.extend(mock_supplier_invoices());

    mock_invoices
}
