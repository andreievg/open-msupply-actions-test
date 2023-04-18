use crate::sync::{
    test::TestSyncPullRecord,
    translations::{
        IntegrationRecords, LegacyTableName, PullDeleteRecord, PullDeleteRecordTable,
        PullUpsertRecord,
    },
};
use repository::{StoreRow, SyncBufferRow};
use util::inline_init;

const STORE_1: (&'static str, &'static str) = (
    "4E27CEB263354EB7B1B33CEA8F7884D8",
    r#"{
    "ID": "4E27CEB263354EB7B1B33CEA8F7884D8",
    "name": "General",
    "code": "GEN",
    "name_ID": "1FB32324AF8049248D929CFB35F255BA",
    "mwks_export_mode": "",
    "IS_HIS": false,
    "sort_issues_by_status_spare": false,
    "disabled": false,
    "responsible_user_ID": "",
    "organisation_name": "",
    "address_1": "",
    "address_2": "",
    "logo": "No logo",
    "sync_id_remote_site": 1,
    "address_3": "",
    "address_4": "",
    "address_5": "",
    "postal_zip_code": "",
    "store_mode": "store",
    "phone": "",
    "tags": "testtag1 tagwithweirdchars`$",
    "spare_user_1": "",
    "spare_user_2": "",
    "spare_user_3": "",
    "spare_user_4": "",
    "spare_user_5": "",
    "spare_user_6": "",
    "spare_user_7": "",
    "spare_user_8": "",
    "spare_user_9": "",
    "spare_user_10": "",
    "spare_user_11": "",
    "spare_user_12": "",
    "spare_user_13": "",
    "spare_user_14": "",
    "spare_user_15": "",
    "spare_user_16": "",
    "custom_data": null,
    "created_date": "2021-09-03"
}"#,
);

fn store_1() -> TestSyncPullRecord {
    TestSyncPullRecord::new_pull_upserts(
        LegacyTableName::STORE,
        STORE_1,
        vec![PullUpsertRecord::Store(inline_init(|s: &mut StoreRow| {
            s.id = STORE_1.0.to_owned();
            s.name_id = "1FB32324AF8049248D929CFB35F255BA".to_string();
            s.code = "GEN".to_string();
            s.site_id = 1;
            s.logo = Some("No logo".to_string());
        }))],
    )
}

const STORE_2: (&'static str, &'static str) = (
    "9EDD3F83C3D64C22A3CC9C98CF4967C5",
    r#"{
    "ID": "9EDD3F83C3D64C22A3CC9C98CF4967C5",
    "name": "Drug Registration",
    "code": "DRG",
    "name_ID": "9A3F71AA4C6D48649ADBC4B2966C5B9D",
    "mwks_export_mode": "",
    "IS_HIS": false,
    "sort_issues_by_status_spare": false,
    "disabled": false,
    "responsible_user_ID": "",
    "organisation_name": "",
    "address_1": "",
    "address_2": "",
    "logo": "",
    "sync_id_remote_site": 1,
    "address_3": "",
    "address_4": "",
    "address_5": "",
    "postal_zip_code": "",
    "store_mode": "drug_registration",
    "phone": "",
    "tags": "",
    "spare_user_1": "",
    "spare_user_2": "",
    "spare_user_3": "",
    "spare_user_4": "",
    "spare_user_5": "",
    "spare_user_6": "",
    "spare_user_7": "",
    "spare_user_8": "",
    "spare_user_9": "",
    "spare_user_10": "",
    "spare_user_11": "",
    "spare_user_12": "",
    "spare_user_13": "",
    "spare_user_14": "",
    "spare_user_15": "",
    "spare_user_16": "",
    "custom_data": null,
    "created_date": "0000-00-00"
}"#,
);

fn store_2() -> TestSyncPullRecord {
    TestSyncPullRecord {
        translated_record: None,
        sync_buffer_row: inline_init(|r: &mut SyncBufferRow| {
            r.table_name = LegacyTableName::STORE.to_owned();
            r.record_id = STORE_2.0.to_owned();
            r.data = STORE_2.1.to_owned();
        }),
        extra_data: None,
    }
}

const STORE_3: (&'static str, &'static str) = (
    "9A3F71AA4C6D48649ADBC4B2966C5B9D",
    r#"{
    "ID": "9A3F71AA4C6D48649ADBC4B2966C5B9D",
    "name": "Supervisor- All stores",
    "code": "SM",
    "name_ID": "",
    "mwks_export_mode": "",
    "IS_HIS": false,
    "sort_issues_by_status_spare": false,
    "disabled": false,
    "responsible_user_ID": "",
    "organisation_name": "",
    "address_1": "",
    "address_2": "",
    "logo": "",
    "sync_id_remote_site": 1,
    "address_3": "",
    "address_4": "",
    "address_5": "",
    "postal_zip_code": "",
    "store_mode": "supervisor",
    "phone": "",
    "tags": "program_tag1 program_tag2",
    "spare_user_1": "",
    "spare_user_2": "",
    "spare_user_3": "",
    "spare_user_4": "",
    "spare_user_5": "",
    "spare_user_6": "",
    "spare_user_7": "",
    "spare_user_8": "",
    "spare_user_9": "",
    "spare_user_10": "",
    "spare_user_11": "",
    "spare_user_12": "",
    "spare_user_13": "",
    "spare_user_14": "",
    "spare_user_15": "",
    "spare_user_16": "",
    "custom_data": null,
    "created_date": "0000-00-00"
}"#,
);

fn store_3() -> TestSyncPullRecord {
    TestSyncPullRecord {
        translated_record: None,
        sync_buffer_row: inline_init(|r: &mut SyncBufferRow| {
            r.table_name = LegacyTableName::STORE.to_owned();
            r.record_id = STORE_3.0.to_owned();
            r.data = STORE_3.1.to_owned();
        }),
        extra_data: None,
    }
}

const STORE_4: (&'static str, &'static str) = (
    "2CD38EF518764ED79258961101100C3D",
    r#"{
    "ID": "2CD38EF518764ED79258961101100C3D",
    "name": "Hospital Info System",
    "code": "HIS",
    "name_ID": "",
    "mwks_export_mode": "",
    "IS_HIS": true,
    "sort_issues_by_status_spare": false,
    "disabled": false,
    "responsible_user_ID": "",
    "organisation_name": "",
    "address_1": "",
    "address_2": "",
    "logo": "",
    "sync_id_remote_site": 1,
    "address_3": "",
    "address_4": "",
    "address_5": "",
    "postal_zip_code": "",
    "store_mode": "his",
    "phone": "",
    "tags": "program1",
    "spare_user_1": "",
    "spare_user_2": "",
    "spare_user_3": "",
    "spare_user_4": "",
    "spare_user_5": "",
    "spare_user_6": "",
    "spare_user_7": "",
    "spare_user_8": "",
    "spare_user_9": "",
    "spare_user_10": "",
    "spare_user_11": "",
    "spare_user_12": "",
    "spare_user_13": "",
    "spare_user_14": "",
    "spare_user_15": "",
    "spare_user_16": "",
    "custom_data": null,
    "created_date": "2021-09-03"
}"#,
);

fn store_4() -> TestSyncPullRecord {
    TestSyncPullRecord {
        translated_record: None,
        sync_buffer_row: inline_init(|r: &mut SyncBufferRow| {
            r.table_name = LegacyTableName::STORE.to_owned();
            r.record_id = STORE_4.0.to_owned();
            r.data = STORE_4.1.to_owned();
        }),
        extra_data: None,
    }
}

pub(crate) fn test_pull_upsert_records() -> Vec<TestSyncPullRecord> {
    vec![store_1(), store_2(), store_3(), store_4()]
}

pub(crate) fn test_pull_delete_records() -> Vec<TestSyncPullRecord> {
    vec![TestSyncPullRecord::new_pull_deletes(
        LegacyTableName::STORE,
        STORE_4.0,
        IntegrationRecords {
            upserts: Vec::new(),
            deletes: vec![PullDeleteRecord {
                id: STORE_4.0.to_owned(),
                table: PullDeleteRecordTable::Store,
            }],
        },
    )]
}
