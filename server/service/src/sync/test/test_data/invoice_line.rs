use super::TestSyncOutgoingRecord;
use crate::sync::{
    test::TestSyncIncomingRecord,
    translations::invoice_line::{LegacyTransLineRow, LegacyTransLineType},
};
use chrono::NaiveDate;
use repository::{
    mock::{mock_item_a, mock_stock_line_a},
    InvoiceLineRow, InvoiceLineRowDelete, InvoiceLineType,
};
use serde_json::json;
const TABLE_NAME: &str = "trans_line";

const TRANS_LINE_1: (&str, &str) = (
    "12ee2f10f0d211eb8dddb54df6d741bc",
    r#"{
        "ID": "12ee2f10f0d211eb8dddb54df6d741bc",
        "Weight": 0,
        "barcodeID": "",
        "batch": "stocktake_1",
        "box_number": "",
        "cost_price": 10,
        "custom_data": null,
        "donor_id": "",
        "expiry_date": "0000-00-00",
        "foreign_currency_price": 0,
        "goods_received_lines_ID": "",
        "isVVMPassed": "",
        "is_from_inventory_adjustment": true,
        "item_ID": "item_a",
        "item_line_ID": "item_a_line_a",
        "item_name": "Item A",
        "line_number": 1,
        "linked_trans_line_ID": "",
        "linked_transact_id": "",
        "local_charge_line_total": 0,
        "location_ID": "",
        "manufacturer_ID": "",
        "medicine_administrator_ID": "",
        "note": "",
        "optionID": "",
        "order_lines_ID": "",
        "pack_inners_in_outer": 0,
        "pack_size": 1,
        "pack_size_inner": 0,
        "prescribedQuantity": 0,
        "price_extension": 0,
        "quantity": 700.36363636,
        "repeat_ID": "",
        "sell_price": 0,
        "sentQuantity": 0,
        "sent_pack_size": 1,
        "source_backorder_id": "",
        "spare": 0,
        "supp_trans_line_ID_ns": "",
        "transaction_ID": "outbound_shipment_a",
        "type": "stock_in",
        "user_1": "",
        "user_2": "",
        "user_3": "",
        "user_4": "",
        "user_5_ID": "",
        "user_6_ID": "",
        "user_7_ID": "",
        "user_8_ID": "",
        "vaccine_vial_monitor_status_ID": "",
        "volume_per_pack": 0
        }
    "#,
);
fn trans_line_1_pull_record() -> TestSyncIncomingRecord {
    TestSyncIncomingRecord::new_pull_upsert(
        TABLE_NAME,
        TRANS_LINE_1,
        InvoiceLineRow {
            id: TRANS_LINE_1.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_link_id: mock_item_a().id,
            item_name: mock_item_a().name,
            item_code: mock_item_a().code,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: Some("stocktake_1".to_string()),
            expiry_date: None,
            pack_size: 1.0,
            cost_price_per_pack: 10.0,
            sell_price_per_pack: 0.0,
            total_before_tax: 10.0 * 700.36363636,
            total_after_tax: 10.0 * 700.36363636,
            tax_percentage: None,
            r#type: InvoiceLineType::StockIn,
            number_of_packs: 700.36363636,
            prescribed_quantity: None,
            note: None,
            inventory_adjustment_reason_id: None,
            return_reason_id: None,
            foreign_currency_price_before_tax: Some(0.0),
            item_variant_id: None,
        },
    )
}
fn trans_line_1_push_record() -> TestSyncOutgoingRecord {
    TestSyncOutgoingRecord {
        record_id: TRANS_LINE_1.0.to_string(),
        table_name: TABLE_NAME.to_string(),
        push_data: json!(LegacyTransLineRow {
            id: TRANS_LINE_1.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_id: mock_item_a().id,
            item_name: mock_item_a().name,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: Some("stocktake_1".to_string()),
            expiry_date: None,
            pack_size: 1.0,
            cost_price_per_pack: 10.0,
            sell_price_per_pack: 0.0,
            r#type: LegacyTransLineType::StockIn,
            number_of_packs: 700.36363636,
            prescribed_quantity: None,
            note: None,
            item_code: Some("item_a_code".to_string()),
            tax_percentage: None,
            total_before_tax: Some(10.0 * 700.36363636),
            total_after_tax: Some(10.0 * 700.36363636),
            option_id: None,
            foreign_currency_price_before_tax: Some(0.0),
            item_variant_id: None,
        }),
    }
}

// placeholder
const TRANS_LINE_2: (&str, &str) = (
    "C9A2D5854A15457388C8266D95DE1945",
    r#"{
        "ID": "C9A2D5854A15457388C8266D95DE1945",
        "Weight": 0,
        "barcodeID": "",
        "batch": "",
        "box_number": "",
        "cost_price": 5,
        "custom_data": null,
        "donor_id": "",
        "expiry_date": "2022-02-22",
        "foreign_currency_price": 0,
        "goods_received_lines_ID": "",
        "isVVMPassed": "",
        "is_from_inventory_adjustment": false,
        "item_ID": "item_a",
        "item_line_ID": "item_a_line_a",
        "item_name": "Item A",
        "line_number": 1,
        "linked_trans_line_ID": "",
        "linked_transact_id": "",
        "local_charge_line_total": 0,
        "location_ID": "",
        "manufacturer_ID": "",
        "medicine_administrator_ID": "",
        "note": "every FOUR to SIX hours when necessary ",
        "optionID": "",
        "order_lines_ID": "",
        "pack_inners_in_outer": 0,
        "pack_size": 5,
        "pack_size_inner": 0,
        "prescribedQuantity": 0,
        "price_extension": 0,
        "quantity": 1000.9124798,
        "repeat_ID": "",
        "sell_price": 2,
        "sentQuantity": 0,
        "sent_pack_size": 100,
        "source_backorder_id": "",
        "spare": 0,
        "supp_trans_line_ID_ns": "",
        "transaction_ID": "outbound_shipment_a",
        "type": "stock_out",
        "user_1": "",
        "user_2": "",
        "user_3": "",
        "user_4": "",
        "user_5_ID": "",
        "user_6_ID": "",
        "user_7_ID": "",
        "user_8_ID": "",
        "vaccine_vial_monitor_status_ID": "",
        "volume_per_pack": 0
    }"#,
);
fn trans_line_2_pull_record() -> TestSyncIncomingRecord {
    TestSyncIncomingRecord::new_pull_upsert(
        TABLE_NAME,
        TRANS_LINE_2,
        InvoiceLineRow {
            id: TRANS_LINE_2.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_link_id: mock_item_a().id,
            item_name: mock_item_a().name,
            item_code: mock_item_a().code,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: None,
            expiry_date: Some(NaiveDate::from_ymd_opt(2022, 2, 22).unwrap()),
            pack_size: 5.0,
            cost_price_per_pack: 5.0,
            sell_price_per_pack: 2.0,
            total_before_tax: 2.0 * 1000.9124798,
            total_after_tax: 2.0 * 1000.9124798,
            tax_percentage: None,
            r#type: InvoiceLineType::StockOut,
            number_of_packs: 1000.9124798,
            prescribed_quantity: None,
            note: Some("every FOUR to SIX hours when necessary ".to_string()),
            inventory_adjustment_reason_id: None,
            return_reason_id: None,
            foreign_currency_price_before_tax: Some(0.0),
            item_variant_id: None,
        },
    )
}
fn trans_line_2_push_record() -> TestSyncOutgoingRecord {
    TestSyncOutgoingRecord {
        table_name: TABLE_NAME.to_string(),
        record_id: TRANS_LINE_2.0.to_string(),
        push_data: json!(LegacyTransLineRow {
            id: TRANS_LINE_2.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_id: mock_item_a().id,
            item_name: mock_item_a().name,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: None,
            expiry_date: Some(NaiveDate::from_ymd_opt(2022, 2, 22).unwrap()),
            pack_size: 5.0,
            cost_price_per_pack: 5.0,
            sell_price_per_pack: 2.0,
            r#type: LegacyTransLineType::StockOut,
            number_of_packs: 1000.9124798,
            prescribed_quantity: None,
            note: Some("every FOUR to SIX hours when necessary ".to_string()),
            item_code: Some("item_a_code".to_string()),
            tax_percentage: None,
            total_before_tax: Some(2.0 * 1000.9124798),
            total_after_tax: Some(2.0 * 1000.9124798),
            option_id: None,
            foreign_currency_price_before_tax: Some(0.0),
            item_variant_id: None,
        }),
    }
}

const TRANS_LINE_OM_FIELDS: (&str, &str) = (
    "A9A2D5854A15457388C8266D95DE1945",
    r#"{
        "ID": "A9A2D5854A15457388C8266D95DE1945",
        "Weight": 0,
        "barcodeID": "",
        "batch": "",
        "box_number": "",
        "cost_price": 5,
        "custom_data": null,
        "donor_id": "",
        "expiry_date": "2022-02-22",
        "foreign_currency_price": 0,
        "goods_received_lines_ID": "",
        "isVVMPassed": "",
        "is_from_inventory_adjustment": false,
        "item_ID": "item_a",
        "item_line_ID": "item_a_line_a",
        "item_name": "Item A",
        "line_number": 1,
        "linked_trans_line_ID": "",
        "linked_transact_id": "",
        "local_charge_line_total": 0,
        "location_ID": "",
        "manufacturer_ID": "",
        "medicine_administrator_ID": "",
        "note": "every FOUR to SIX hours when necessary ",
        "optionID": "",
        "order_lines_ID": "",
        "pack_inners_in_outer": 0,
        "pack_size": 5,
        "pack_size_inner": 0,
        "prescribedQuantity": 0,
        "price_extension": 0,
        "quantity": 1000.9124798,
        "repeat_ID": "",
        "sell_price": 2,
        "sentQuantity": 0,
        "sent_pack_size": 100,
        "source_backorder_id": "",
        "spare": 0,
        "supp_trans_line_ID_ns": "",
        "transaction_ID": "outbound_shipment_a",
        "type": "stock_out",
        "user_1": "",
        "user_2": "",
        "user_3": "",
        "user_4": "",
        "user_5_ID": "",
        "user_6_ID": "",
        "user_7_ID": "",
        "user_8_ID": "",
        "vaccine_vial_monitor_status_ID": "",
        "volume_per_pack": 0,
        "om_item_code": "item_a_code",
        "om_tax": 33.3,
        "om_total_before_tax": 105.4,
        "om_total_after_tax": 130.5,
        "om_item_variant_id": "5fb99f9c-03f4-47f2-965b-c9ecd083c675"
    }"#,
);
fn trans_line_om_fields_pull_record() -> TestSyncIncomingRecord {
    TestSyncIncomingRecord::new_pull_upsert(
        TABLE_NAME,
        TRANS_LINE_OM_FIELDS,
        InvoiceLineRow {
            id: TRANS_LINE_OM_FIELDS.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_link_id: mock_item_a().id,
            item_name: mock_item_a().name,
            item_code: mock_item_a().code,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: None,
            expiry_date: Some(NaiveDate::from_ymd_opt(2022, 2, 22).unwrap()),
            pack_size: 5.0,
            cost_price_per_pack: 5.0,
            sell_price_per_pack: 2.0,
            total_before_tax: 105.4,
            total_after_tax: 130.5,
            tax_percentage: Some(33.3),
            r#type: InvoiceLineType::StockOut,
            number_of_packs: 1000.9124798,
            prescribed_quantity: None,
            note: Some("every FOUR to SIX hours when necessary ".to_string()),
            inventory_adjustment_reason_id: None,
            return_reason_id: None,
            foreign_currency_price_before_tax: Some(0.0),
            item_variant_id: Some("5fb99f9c-03f4-47f2-965b-c9ecd083c675".to_string()),
        },
    )
}
fn trans_line_om_fields_push_record() -> TestSyncOutgoingRecord {
    TestSyncOutgoingRecord {
        table_name: TABLE_NAME.to_string(),
        record_id: TRANS_LINE_OM_FIELDS.0.to_string(),
        push_data: json!(LegacyTransLineRow {
            id: TRANS_LINE_OM_FIELDS.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_id: mock_item_a().id,
            item_name: mock_item_a().name,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: None,
            expiry_date: Some(NaiveDate::from_ymd_opt(2022, 2, 22).unwrap()),
            pack_size: 5.0,
            cost_price_per_pack: 5.0,
            sell_price_per_pack: 2.0,
            r#type: LegacyTransLineType::StockOut,
            number_of_packs: 1000.9124798,
            prescribed_quantity: None,
            note: Some("every FOUR to SIX hours when necessary ".to_string()),
            item_code: Some("item_a_code".to_string()),
            tax_percentage: Some(33.3),
            total_before_tax: Some(105.4),
            total_after_tax: Some(130.5),
            option_id: None,
            foreign_currency_price_before_tax: Some(0.0),
            item_variant_id: Some("5fb99f9c-03f4-47f2-965b-c9ecd083c675".to_string()),
        }),
    }
}

const TRANS_LINE_OM_UNSET_TAX_FIELDS: (&str, &str) = (
    "4A15457388C8266D95DE1945A9A2D585",
    r#"{
        "ID": "4A15457388C8266D95DE1945A9A2D585",
        "Weight": 0,
        "barcodeID": "",
        "batch": "",
        "box_number": "",
        "cost_price": 5,
        "custom_data": null,
        "donor_id": "",
        "expiry_date": "2022-02-22",
        "foreign_currency_price": 0,
        "goods_received_lines_ID": "",
        "isVVMPassed": "",
        "is_from_inventory_adjustment": false,
        "item_ID": "item_a",
        "item_line_ID": "item_a_line_a",
        "item_name": "Item A",
        "line_number": 1,
        "linked_trans_line_ID": "",
        "linked_transact_id": "",
        "local_charge_line_total": 0,
        "location_ID": "",
        "manufacturer_ID": "",
        "medicine_administrator_ID": "",
        "note": "every FOUR to SIX hours when necessary ",
        "optionID": "0",
        "order_lines_ID": "",
        "pack_inners_in_outer": 0,
        "pack_size": 5,
        "pack_size_inner": 0,
        "prescribedQuantity": 0,
        "price_extension": 0,
        "quantity": 1000.9124798,
        "repeat_ID": "",
        "sell_price": 2,
        "sentQuantity": 0,
        "sent_pack_size": 100,
        "source_backorder_id": "",
        "spare": 0,
        "supp_trans_line_ID_ns": "",
        "transaction_ID": "outbound_shipment_a",
        "type": "stock_out",
        "user_1": "",
        "user_2": "",
        "user_3": "",
        "user_4": "",
        "user_5_ID": "",
        "user_6_ID": "",
        "user_7_ID": "",
        "user_8_ID": "",
        "vaccine_vial_monitor_status_ID": "",
        "volume_per_pack": 0,
        "om_item_code": "item_a_code",
        "om_tax": null,
        "om_total_before_tax": 105.4,
        "om_total_after_tax": 130.5
    }"#,
);
fn trans_line_om_fields_unset_tax_pull_record() -> TestSyncIncomingRecord {
    TestSyncIncomingRecord::new_pull_upsert(
        TABLE_NAME,
        TRANS_LINE_OM_UNSET_TAX_FIELDS,
        InvoiceLineRow {
            id: TRANS_LINE_OM_UNSET_TAX_FIELDS.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_link_id: mock_item_a().id,
            item_name: mock_item_a().name,
            item_code: mock_item_a().code,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: None,
            expiry_date: Some(NaiveDate::from_ymd_opt(2022, 2, 22).unwrap()),
            pack_size: 5.0,
            cost_price_per_pack: 5.0,
            sell_price_per_pack: 2.0,
            total_before_tax: 105.4,
            total_after_tax: 130.5,
            tax_percentage: None,
            r#type: InvoiceLineType::StockOut,
            number_of_packs: 1000.9124798,
            prescribed_quantity: None,
            note: Some("every FOUR to SIX hours when necessary ".to_string()),
            inventory_adjustment_reason_id: None,
            return_reason_id: None,
            foreign_currency_price_before_tax: Some(0.0),
            item_variant_id: None,
        },
    )
}
fn trans_line_om_fields_unset_tax_push_record() -> TestSyncOutgoingRecord {
    TestSyncOutgoingRecord {
        table_name: TABLE_NAME.to_string(),
        record_id: TRANS_LINE_OM_UNSET_TAX_FIELDS.0.to_string(),
        push_data: json!(LegacyTransLineRow {
            id: TRANS_LINE_OM_UNSET_TAX_FIELDS.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_id: mock_item_a().id,
            item_name: mock_item_a().name,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: None,
            expiry_date: Some(NaiveDate::from_ymd_opt(2022, 2, 22).unwrap()),
            pack_size: 5.0,
            cost_price_per_pack: 5.0,
            sell_price_per_pack: 2.0,
            r#type: LegacyTransLineType::StockOut,
            number_of_packs: 1000.9124798,
            prescribed_quantity: None,
            note: Some("every FOUR to SIX hours when necessary ".to_string()),
            item_code: Some("item_a_code".to_string()),
            tax_percentage: None,
            total_before_tax: Some(105.4),
            total_after_tax: Some(130.5),
            option_id: None,
            foreign_currency_price_before_tax: Some(0.0),
            item_variant_id: None,
        }),
    }
}

/// When invoice line was cancelled
const TRANS_LINE_NEGATIVE: (&str, &str) = (
    "1CC10911C7F64369B965181D78696837",
    r#"{        
        "ID": "1CC10911C7F64369B965181D78696837",
        "transaction_ID": "outbound_shipment_a",
        "item_ID": "item_a",
        "batch": "",
        "price_extension": -4000,
        "note": "",
        "sell_price": -200,
        "expiry_date": "0000-00-00",
        "cost_price": -200,
        "pack_size": 1,
        "quantity": -20,
        "box_number": "",
        "item_line_ID": "item_a_line_a",
        "line_number": 1,
        "item_name": "Item A",
        "supp_trans_line_ID_ns": "",
        "goods_received_lines_ID": "",
        "manufacturer_ID": "",
        "foreign_currency_price": -200,
        "location_ID": "",
        "volume_per_pack": 0,
        "repeat_ID": "",
        "user_1": "",
        "user_2": "",
        "user_3": "",
        "user_4": "",
        "pack_size_inner": 0,
        "pack_inners_in_outer": 0,
        "is_from_inventory_adjustment": false,
        "Weight": 0,
        "source_backorder_id": "",
        "order_lines_ID": "",
        "donor_id": "",
        "local_charge_line_total": 0,
        "type": "stock_out",
        "linked_transact_id": "",
        "user_5_ID": "",
        "user_6_ID": "",
        "user_7_ID": "",
        "user_8_ID": "",
        "linked_trans_line_ID": "",
        "barcodeID": "",
        "sentQuantity": 0,
        "optionID": "",
        "isVVMPassed": "",
        "program_ID": "",
        "prescribedQuantity": 0,
        "vaccine_vial_monitor_status_ID": "",
        "sent_pack_size": 0,
        "custom_data": null,
        "medicine_administrator_ID": "",
        "om_item_code": null,
        "om_tax": null,
        "om_total_before_tax": null,
        "om_total_after_tax": null,
        "om_item_variant_id": null
    }"#,
);
fn trans_line_negative() -> TestSyncIncomingRecord {
    TestSyncIncomingRecord::new_pull_upsert(
        TABLE_NAME,
        TRANS_LINE_NEGATIVE,
        InvoiceLineRow {
            id: TRANS_LINE_NEGATIVE.0.to_string(),
            invoice_id: "outbound_shipment_a".to_string(),
            item_link_id: mock_item_a().id,
            item_name: mock_item_a().name,
            item_code: mock_item_a().code,
            stock_line_id: Some(mock_stock_line_a().id),
            location_id: None,
            batch: None,
            expiry_date: None,
            pack_size: 1.0,
            cost_price_per_pack: 200.0,
            sell_price_per_pack: 200.0,
            total_before_tax: 4000.0,
            total_after_tax: 4000.0,
            tax_percentage: None,
            r#type: InvoiceLineType::StockIn,
            number_of_packs: 20.0,
            prescribed_quantity: None,
            note: None,
            inventory_adjustment_reason_id: None,
            return_reason_id: None,
            foreign_currency_price_before_tax: Some(200.0),
            item_variant_id: None,
        },
    )
}

pub(crate) fn test_pull_upsert_records() -> Vec<TestSyncIncomingRecord> {
    vec![
        trans_line_1_pull_record(),
        trans_line_2_pull_record(),
        trans_line_om_fields_pull_record(),
        trans_line_om_fields_unset_tax_pull_record(),
        trans_line_negative(),
    ]
}

pub(crate) fn test_pull_delete_records() -> Vec<TestSyncIncomingRecord> {
    vec![TestSyncIncomingRecord::new_pull_delete(
        TABLE_NAME,
        TRANS_LINE_OM_UNSET_TAX_FIELDS.0,
        InvoiceLineRowDelete(TRANS_LINE_OM_UNSET_TAX_FIELDS.0.to_string()),
    )]
}

pub(crate) fn test_push_records() -> Vec<TestSyncOutgoingRecord> {
    vec![
        trans_line_1_push_record(),
        trans_line_2_push_record(),
        trans_line_om_fields_push_record(),
        trans_line_om_fields_unset_tax_push_record(),
    ]
}

// mock data for prescribed quantity
// {
//     "ID": "C6CF33BB6BD94D30BF0F691CB9A3E9FD",
//     "Weight": 0,
//     "barcodeID": "",
//     "batch": "ABC123",
//     "box_number": "",
//     "cost_price": 10,
//     "custom_data": null,
//     "donor_id": "",
//     "expiry_date": "2025-08-31",
//     "foreign_currency_price": 10,
//     "goods_received_lines_ID": "",
//     "isVVMPassed": "",
//     "is_from_inventory_adjustment": false,
//     "item_ID": "AA6A1FE8871D4058A84CED49DADD23A9",
//     "item_line_ID": "6a825c11-dd4a-4408-ba18-2708b2d1ac2d",
//     "item_name": "Acetylsalicylic Acid 100mg tabs",
//     "line_number": 2,
//     "linked_trans_line_ID": "",
//     "linked_transact_id": "",
//     "local_charge_line_total": 0,
//     "location_ID": "",
//     "manufacturer_ID": "",
//     "medicine_administrator_ID": "",
//     "note": "every FOUR to SIX hours when necessary ",
//     "om_item_code": null,
//     "om_item_variant_id": null,
//     "om_tax": null,
//     "om_total_after_tax": null,
//     "om_total_before_tax": null,
//     "optionID": "",
//     "order_lines_ID": "",
//     "pack_inners_in_outer": 0,
//     "pack_size": 1,
//     "pack_size_inner": 0,
//     "prescribedQuantity": 21,
//     "price_extension": 10,
//     "program_ID": "",
//     "quantity": 1,
//     "repeat_ID": "",
//     "sell_price": 10,
//     "sentQuantity": 0,
//     "sent_pack_size": 0,
//     "source_backorder_id": "",
//     "supp_trans_line_ID_ns": "",
//     "transaction_ID": "364BA5F646014CC6BEAE44B459CBE60A",
//     "type": "stock_out",
//     "user_1": "",
//     "user_2": "",
//     "user_3": "",
//     "user_4": "",
//     "user_5_ID": "",
//     "user_6_ID": "",
//     "user_7_ID": "",
//     "user_8_ID": "",
//     "vaccine_vial_monitor_status_ID": "",
//     "volume_per_pack": 0
// }
