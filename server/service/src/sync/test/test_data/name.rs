use crate::sync::{
    test::TestSyncPullRecord,
    translations::{LegacyTableName, PullDeleteRecordTable, PullUpsertRecord},
};
use chrono::NaiveDate;
use repository::{Gender, NameRow, NameType};

const NAME_1: (&'static str, &'static str) = (
    "1FB32324AF8049248D929CFB35F255BA",
    r#"{
    "ID": "1FB32324AF8049248D929CFB35F255BA",
    "name": "General",
    "fax": "",
    "phone": "0123456789",
    "customer": true,
    "bill_address1": "address1",
    "bill_address2": "address2",
    "supplier": true,
    "charge code": "GEN",
    "margin": 0,
    "comment": "name comment",
    "currency_ID": "",
    "country": "name country",
    "freightfac": 0,
    "email": "name email",
    "custom1": "",
    "code": "GEN",
    "last": "last_name",
    "first": "first_name",
    "title": "",
    "female": true,
    "date_of_birth": "0000-00-00",
    "overpayment": 0,
    "group_ID": "",
    "hold": true,
    "ship_address1": "",
    "ship_address2": "",
    "url": "name website",
    "barcode": "",
    "postal_address1": "",
    "postal_address2": "",
    "category1_ID": "",
    "region_ID": "",
    "type": "patient",
    "price_category": "",
    "flag": "",
    "manufacturer": true,
    "print_invoice_alphabetical": false,
    "custom2": "",
    "custom3": "",
    "default_order_days": 0,
    "connection_type": 0,
    "PATIENT_PHOTO": "[object Picture]",
    "NEXT_OF_KIN_ID": "",
    "POBOX": "",
    "ZIP": 0,
    "middle": "",
    "preferred": false,
    "Blood_Group": "",
    "marital_status": "",
    "Benchmark": false,
    "next_of_kin_relative": "",
    "mother_id": "",
    "postal_address3": "",
    "postal_address4": "",
    "bill_address3": "",
    "bill_address4": "",
    "ship_address3": "",
    "ship_address4": "",
    "ethnicity_ID": "",
    "occupation_ID": "",
    "religion_ID": "",
    "national_health_number": "",
    "Master_RTM_Supplier_Code": 0,
    "ordering_method": "",
    "donor": false,
    "latitude": 0,
    "longitude": 0,
    "Master_RTM_Supplier_name": "",
    "category2_ID": "",
    "category3_ID": "",
    "category4_ID": "",
    "category5_ID": "",
    "category6_ID": "",
    "bill_address5": "",
    "bill_postal_zip_code": "",
    "postal_address5": "",
    "postal_zip_code": "",
    "ship_address5": "",
    "ship_postal_zip_code": "",
    "supplying_store_id": "",
    "license_number": "",
    "license_expiry": "0000-00-00",
    "has_current_license": false,
    "custom_data": null,
    "maximum_credit": 0,
    "nationality_ID": "",
    "created_date": "2022-02-10"
}"#,
);

fn name_1() -> TestSyncPullRecord {
    TestSyncPullRecord::new_pull_upsert(
        LegacyTableName::NAME,
        NAME_1,
        PullUpsertRecord::Name(NameRow {
            id: NAME_1.0.to_owned(),
            name: "General".to_owned(),
            code: "GEN".to_owned(),
            r#type: NameType::Patient,
            is_supplier: true,
            is_customer: true,

            supplying_store_id: None,
            first_name: Some("first_name".to_string()),
            last_name: Some("last_name".to_string()),
            gender: Some(Gender::Female),
            date_of_birth: None,
            phone: Some("0123456789".to_string()),
            charge_code: Some("GEN".to_string()),
            comment: Some("name comment".to_string()),
            country: Some("name country".to_string()),
            email: Some("name email".to_string()),
            website: Some("name website".to_string()),
            is_manufacturer: true,
            is_donor: false,
            on_hold: true,
            address1: Some("address1".to_string()),
            address2: Some("address2".to_string()),
            created_datetime: Some(
                NaiveDate::from_ymd_opt(2022, 02, 10)
                    .unwrap()
                    .and_hms_opt(0, 0, 0)
                    .unwrap(),
            ),
        }),
    )
}

const NAME_2: (&'static str, &'static str) = (
    "9EDD3F83C3D64C22A3CC9C98CF4967C4",
    r#"{
    "ID": "9EDD3F83C3D64C22A3CC9C98CF4967C4",
    "name": "Birch Store",
    "fax": "",
    "phone": "",
    "customer": true,
    "bill_address1": "234 Evil Street",
    "bill_address2": "Scotland",
    "supplier": false,
    "charge code": "SNA",
    "margin": 0,
    "comment": "",
    "currency_ID": "8009D512AC0E4FD78625E3C8273B0171",
    "country": "",
    "freightfac": 1,
    "email": "",
    "custom1": "",
    "code": "SNA",
    "last": "",
    "first": "",
    "title": "",
    "female": false,
    "date_of_birth": "0000-00-00",
    "overpayment": 0,
    "group_ID": "",
    "hold": false,
    "ship_address1": "",
    "ship_address2": "",
    "url": "",
    "barcode": "*SNA*",
    "postal_address1": "",
    "postal_address2": "",
    "category1_ID": "",
    "region_ID": "",
    "type": "facility",
    "price_category": "A",
    "flag": "",
    "manufacturer": false,
    "print_invoice_alphabetical": false,
    "custom2": "",
    "custom3": "",
    "default_order_days": 0,
    "connection_type": 0,
    "PATIENT_PHOTO": "[object Picture]",
    "NEXT_OF_KIN_ID": "",
    "POBOX": "",
    "ZIP": 0,
    "middle": "",
    "preferred": false,
    "Blood_Group": "",
    "marital_status": "",
    "Benchmark": false,
    "next_of_kin_relative": "",
    "mother_id": "",
    "postal_address3": "",
    "postal_address4": "",
    "bill_address3": "",
    "bill_address4": "",
    "ship_address3": "",
    "ship_address4": "",
    "ethnicity_ID": "",
    "occupation_ID": "",
    "religion_ID": "",
    "national_health_number": "",
    "Master_RTM_Supplier_Code": 0,
    "ordering_method": "sh",
    "donor": false,
    "latitude": 0,
    "longitude": 0,
    "Master_RTM_Supplier_name": "",
    "category2_ID": "",
    "category3_ID": "",
    "category4_ID": "",
    "category5_ID": "",
    "category6_ID": "",
    "bill_address5": "",
    "bill_postal_zip_code": "",
    "postal_address5": "",
    "postal_zip_code": "",
    "ship_address5": "",
    "ship_postal_zip_code": "",
    "supplying_store_id": "",
    "license_number": "",
    "license_expiry": "0000-00-00",
    "has_current_license": false,
    "custom_data": null,
    "maximum_credit": 0,
    "nationality_ID": "",
    "created_date": "0000-00-00"
}"#,
);

fn name_2() -> TestSyncPullRecord {
    TestSyncPullRecord::new_pull_upsert(
        LegacyTableName::NAME,
        NAME_2,
        PullUpsertRecord::Name(NameRow {
            id: NAME_2.0.to_owned(),
            name: "Birch Store".to_owned(),
            code: "SNA".to_owned(),
            r#type: NameType::Facility,
            is_customer: true,
            is_supplier: false,
            supplying_store_id: None,
            first_name: None,
            last_name: None,
            gender: None,
            date_of_birth: None,
            phone: None,
            charge_code: Some("SNA".to_string()),
            comment: None,
            country: None,
            address1: Some("234 Evil Street".to_string()),
            address2: Some("Scotland".to_string()),
            email: None,
            website: None,
            is_manufacturer: false,
            is_donor: false,
            on_hold: false,
            created_datetime: None,
        }),
    )
}

const NAME_3: (&'static str, &'static str) = (
    "CB929EB86530455AB0392277FAC3DBA4",
    r#"{
    "ID": "CB929EB86530455AB0392277FAC3DBA4",
    "name": "Birch Store 2",
    "fax": "",
    "phone": "",
    "customer": true,
    "bill_address1": "234 Evil Street",
    "bill_address2": "Scotland",
    "supplier": false,
    "charge code": "SNA",
    "margin": 0,
    "comment": "",
    "currency_ID": "8009D512AC0E4FD78625E3C8273B0171",
    "country": "",
    "freightfac": 1,
    "email": "",
    "custom1": "",
    "code": "SNA",
    "last": "",
    "first": "",
    "title": "",
    "female": false,
    "date_of_birth": "0000-00-00",
    "overpayment": 0,
    "group_ID": "",
    "hold": false,
    "ship_address1": "",
    "ship_address2": "",
    "url": "",
    "barcode": "*SNA*",
    "postal_address1": "",
    "postal_address2": "",
    "category1_ID": "",
    "region_ID": "",
    "type": "facility",
    "price_category": "A",
    "flag": "",
    "manufacturer": false,
    "print_invoice_alphabetical": false,
    "custom2": "",
    "custom3": "",
    "default_order_days": 0,
    "connection_type": 0,
    "PATIENT_PHOTO": "[object Picture]",
    "NEXT_OF_KIN_ID": "",
    "POBOX": "",
    "ZIP": 0,
    "middle": "",
    "preferred": false,
    "Blood_Group": "",
    "marital_status": "",
    "Benchmark": false,
    "next_of_kin_relative": "",
    "mother_id": "",
    "postal_address3": "",
    "postal_address4": "",
    "bill_address3": "",
    "bill_address4": "",
    "ship_address3": "",
    "ship_address4": "",
    "ethnicity_ID": "",
    "occupation_ID": "",
    "religion_ID": "",
    "national_health_number": "",
    "Master_RTM_Supplier_Code": 0,
    "ordering_method": "sh",
    "donor": false,
    "latitude": 0,
    "longitude": 0,
    "Master_RTM_Supplier_name": "",
    "category2_ID": "",
    "category3_ID": "",
    "category4_ID": "",
    "category5_ID": "",
    "category6_ID": "",
    "bill_address5": "",
    "bill_postal_zip_code": "",
    "postal_address5": "",
    "postal_zip_code": "",
    "ship_address5": "",
    "ship_postal_zip_code": "",
    "supplying_store_id": "",
    "license_number": "",
    "license_expiry": "0000-00-00",
    "has_current_license": false,
    "custom_data": null,
    "maximum_credit": 0,
    "nationality_ID": "",
    "created_date": "0000-00-00"
}"#,
);

fn name_3() -> TestSyncPullRecord {
    TestSyncPullRecord::new_pull_upsert(
        LegacyTableName::NAME,
        NAME_3,
        PullUpsertRecord::Name(NameRow {
            id: NAME_3.0.to_owned(),
            name: "Birch Store 2".to_owned(),
            code: "SNA".to_owned(),
            r#type: NameType::Facility,
            is_customer: true,
            is_supplier: false,
            supplying_store_id: None,
            first_name: None,
            last_name: None,
            gender: None,
            date_of_birth: None,
            phone: None,
            charge_code: Some("SNA".to_string()),
            comment: None,
            country: None,
            address1: Some("234 Evil Street".to_string()),
            address2: Some("Scotland".to_string()),
            email: None,
            website: None,
            is_manufacturer: false,
            is_donor: false,
            on_hold: false,
            created_datetime: None,
        }),
    )
}

const NAME_4: (&'static str, &'static str) = (
    "C3FB3B30A8D04DDF9AF59A15BB48668A",
    r#"{
      "ID": "C3FB3B30A8D04DDF9AF59A15BB48668A",
      "name": "Moemoe, Alex",
      "fax": "",
      "phone": "02345678",
      "customer": true,
      "bill_address1": "Bikenibeu",
      "bill_address2": "Marakei",
      "supplier": false,
      "charge code": "00102/19/01",
      "margin": 0,
      "comment": "name comment 1",
      "currency_ID": "8009D512AC0E4FD78625E3C8273B0171",
      "country": "NZ",
      "freightfac": 0,
      "email": "email@some.com",
      "custom1": "",
      "code": "00102/19/00",
      "last": "Moemoe",
      "first": "Alex",
      "title": "",
      "female": true,
      "date_of_birth": "1998-07-29",
      "overpayment": 0,
      "group_ID": "",
      "hold": false,
      "ship_address1": "",
      "ship_address2": "",
      "url": "web1",
      "barcode": "b000000000989",
      "postal_address1": "",
      "postal_address2": "",
      "category1_ID": "8C4DDF227AFB4FD6A09445C949079597",
      "region_ID": "",
      "type": "patient",
      "price_category": "A",
      "flag": "",
      "manufacturer": false,
      "print_invoice_alphabetical": false,
      "custom2": "",
      "custom3": "",
      "default_order_days": 0,
      "connection_type": 0,
      "PATIENT_PHOTO": "data:image/png;base64,",
      "NEXT_OF_KIN_ID": "",
      "POBOX": "",
      "ZIP": 0,
      "middle": "",
      "preferred": false,
      "Blood_Group": "",
      "marital_status": "",
      "Benchmark": false,
      "next_of_kin_relative": "",
      "mother_id": "",
      "postal_address3": "",
      "postal_address4": "",
      "bill_address3": "",
      "bill_address4": "",
      "ship_address3": "",
      "ship_address4": "",
      "ethnicity_ID": "",
      "occupation_ID": "",
      "religion_ID": "",
      "national_health_number": "",
      "Master_RTM_Supplier_Code": 0,
      "ordering_method": "",
      "donor": false,
      "latitude": 0,
      "longitude": 0,
      "Master_RTM_Supplier_name": "",
      "category2_ID": "",
      "category3_ID": "",
      "category4_ID": "",
      "category5_ID": "",
      "category6_ID": "",
      "bill_address5": "",
      "bill_postal_zip_code": "",
      "postal_address5": "",
      "postal_zip_code": "",
      "ship_address5": "",
      "ship_postal_zip_code": "",
      "supplying_store_id": "store_a",
      "license_number": "",
      "license_expiry": "0000-00-00",
      "has_current_license": false,
      "custom_data": null,
      "maximum_credit": 0,
      "nationality_ID": "",
      "created_date": "2022-05-22",
      "integration_ID": ""
  }"#,
);

fn name_4() -> TestSyncPullRecord {
    TestSyncPullRecord::new_pull_upsert(
        LegacyTableName::NAME,
        NAME_4,
        PullUpsertRecord::Name(NameRow {
            id: NAME_4.0.to_string(),
            name: "Moemoe, Alex".to_string(),
            code: "00102/19/00".to_string(),
            r#type: repository::NameType::Patient,
            is_customer: true,
            is_supplier: false,
            supplying_store_id: Some("store_a".to_string()),
            first_name: Some("Alex".to_string()),
            last_name: Some("Moemoe".to_string()),
            gender: Some(Gender::Female),
            date_of_birth: Some(NaiveDate::from_ymd_opt(1998, 07, 29).unwrap()),
            phone: Some("02345678".to_string()),
            charge_code: Some("00102/19/01".to_string()),
            comment: Some("name comment 1".to_string()),
            country: Some("NZ".to_string()),
            address1: Some("Bikenibeu".to_string()),
            address2: Some("Marakei".to_string()),
            email: Some("email@some.com".to_string()),
            website: Some("web1".to_string()),
            is_manufacturer: false,
            is_donor: false,
            on_hold: false,
            created_datetime: Some(
                NaiveDate::from_ymd_opt(2022, 05, 22)
                    .unwrap()
                    .and_hms_opt(0, 0, 0)
                    .unwrap(),
            ),
        }),
    )
}

pub(crate) fn test_pull_upsert_records() -> Vec<TestSyncPullRecord> {
    vec![name_1(), name_2(), name_3(), name_4()]
}

pub(crate) fn test_pull_delete_records() -> Vec<TestSyncPullRecord> {
    vec![TestSyncPullRecord::new_pull_delete(
        LegacyTableName::NAME,
        NAME_4.0,
        PullDeleteRecordTable::Name,
    )]
}
