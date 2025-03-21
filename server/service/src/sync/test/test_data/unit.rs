use repository::UnitRow;

use crate::sync::{
    test::TestSyncPullRecord,
    translations::{LegacyTableName, PullDeleteRecordTable, PullUpsertRecord},
};

const UNIT_1: (&'static str, &'static str) = (
    "A02C91EB6C77400BA783C4CD7C565F2A",
    r#"{
        "ID": "A02C91EB6C77400BA783C4CD7C565F2A",
        "units": "Units",
        "comment": "",
        "order_number": 0
    }"#,
);

const UNIT_2: (&'static str, &'static str) = (
    "EC87200254974C609293D88E470598C4",
    r#"{
        "ID": "EC87200254974C609293D88E470598C4",
        "units": "Tab",
        "comment": "",
        "order_number": 1
    }"#,
);

const UNIT_3: (&'static str, &'static str) = (
    "A02C91EB6C77400BA783C4CD7C565F29",
    r#"{
        "ID": "A02C91EB6C77400BA783C4CD7C565F29",
        "units": "Bottle",
        "comment": "This is a bottle unit type",
        "order_number": 2
    }"#,
);

pub(crate) fn test_pull_upsert_records() -> Vec<TestSyncPullRecord> {
    vec![
        TestSyncPullRecord::new_pull_upsert(
            LegacyTableName::UNIT,
            UNIT_1,
            PullUpsertRecord::Unit(UnitRow {
                id: UNIT_1.0.to_owned(),
                name: "Units".to_owned(),
                description: None,
                index: 0,
            }),
        ),
        TestSyncPullRecord::new_pull_upsert(
            LegacyTableName::UNIT,
            UNIT_2,
            PullUpsertRecord::Unit(UnitRow {
                id: UNIT_2.0.to_owned(),
                name: "Tab".to_owned(),
                description: None,
                index: 1,
            }),
        ),
        TestSyncPullRecord::new_pull_upsert(
            LegacyTableName::UNIT,
            UNIT_3,
            PullUpsertRecord::Unit(UnitRow {
                id: UNIT_3.0.to_owned(),
                name: "Bottle".to_owned(),
                description: Some("This is a bottle unit type".to_owned()),
                index: 2,
            }),
        ),
    ]
}

pub(crate) fn test_pull_delete_records() -> Vec<TestSyncPullRecord> {
    vec![TestSyncPullRecord::new_pull_delete(
        LegacyTableName::UNIT,
        UNIT_1.0,
        PullDeleteRecordTable::Unit,
    )]
}
