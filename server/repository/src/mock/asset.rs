use chrono::{NaiveDate, NaiveDateTime};

use crate::assets::asset_row::AssetRow;

/*
Catalogue Code	Class name	Category name	Type name	Manufacturer	Model	Catalogue
E003/002	Cold Chain Equipment	Refrigerators and freezers	Vaccine/Waterpacks freezer	Qingdao Haier Biomedical Co., Ltd	HBD 116	WHO PQS Catalogue
 */
pub fn mock_asset_a() -> AssetRow {
    AssetRow {
        id: String::from("asset_a"),
        name: String::from("Freezer A - HBD 116"),
        code: String::from("asset_a"),
        store_id: None,
        serial_number: Some(String::from("serial_number_a")),
        asset_category_id: None,
        asset_type_id: None,
        catalogue_item_id: None,
        installation_date: Some(NaiveDate::from_ymd_opt(2021, 1, 1).unwrap()),
        replacement_date: None,
        created_datetime: NaiveDateTime::parse_from_str("2021-01-02T00:00:00", "%Y-%m-%dT%H:%M:%S")
            .unwrap(),
        modified_datetime: NaiveDateTime::parse_from_str(
            "2021-01-02T00:00:00",
            "%Y-%m-%dT%H:%M:%S",
        )
        .unwrap(),
        deleted_datetime: None,
    }
}

/*
E004/002	Cold Chain Equipment	Insulated Containers	Vaccine Carrier LR 3L	B Medical Systems Sarl	RCW4	WHO PQS Catalogue
*/

pub fn mock_asset_b() -> AssetRow {
    AssetRow {
        id: String::from("asset_b"),
        name: String::from("Vaccine Carrier LR 3L - RCW4"),
        code: String::from("asset_b"),
        store_id: None,
        serial_number: Some(String::from("serial_number")),
        asset_category_id: None,
        asset_type_id: None,
        catalogue_item_id: None,
        installation_date: Some(NaiveDate::from_ymd_opt(2020, 10, 10).unwrap()),
        replacement_date: None,
        created_datetime: NaiveDateTime::default(),
        modified_datetime: NaiveDateTime::default(),
        deleted_datetime: None,
    }
}

pub fn mock_deleted_asset() -> AssetRow {
    AssetRow {
        id: String::from("deleted_asset"),
        name: String::new(),
        code: String::new(),
        store_id: None,
        serial_number: None,
        asset_category_id: None,
        asset_type_id: None,
        catalogue_item_id: None,
        installation_date: None,
        replacement_date: None,
        created_datetime: NaiveDateTime::default(),
        modified_datetime: NaiveDateTime::default(),
        deleted_datetime: Some(NaiveDateTime::default()),
    }
}

pub fn mock_assets() -> Vec<AssetRow> {
    vec![mock_asset_a(), mock_asset_b(), mock_deleted_asset()]
}
