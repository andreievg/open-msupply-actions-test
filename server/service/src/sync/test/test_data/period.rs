use chrono::NaiveDate;
use repository::PeriodRow;

use crate::sync::{
    test::TestSyncPullRecord,
    translations::{LegacyTableName, PullUpsertRecord},
};

const PERIOD_1: (&'static str, &'static str) = (
    "period_1",
    r#"{
    "ID": "period_1",
    "periodScheduleID": "period_schedule_1",
    "startDate": "2023-01-01",
    "endDate": "2023-01-07",
    "name": "Jan Wk01 2023"
  }"#,
);

const PERIOD_2: (&'static str, &'static str) = (
    "period_2",
    r#"{
    "ID": "period_2",
    "periodScheduleID": "period_schedule_2",
    "startDate": "2023-01-01",
    "endDate": "2023-12-31",
    "name": "2023"
  }"#,
);

const PERIOD_3: (&'static str, &'static str) = (
    "641A3560C84A44BC9E6DDC01F3D75923",
    r#"{
  "ID": "641A3560C84A44BC9E6DDC01F3D75923",
  "endDate": "2020-06-30",
  "name": "2020_Q2",
  "periodScheduleID": "597074CBCCC24166B8C1F82553DACC2F",
  "startDate": "2020-04-01"
}
"#,
);
const PERIOD_4: (&'static str, &'static str) = (
    "772B3984DBA14A5F941ED0EF857FDB31",
    r#"{
  "ID": "772B3984DBA14A5F941ED0EF857FDB31",
  "endDate": "2020-09-30",
  "name": "2020_Q3",
  "periodScheduleID": "597074CBCCC24166B8C1F82553DACC2F",
  "startDate": "2020-07-01"
}

"#,
);

pub(crate) fn test_pull_upsert_records() -> Vec<TestSyncPullRecord> {
    vec![
        TestSyncPullRecord::new_pull_upsert(
            LegacyTableName::PERIOD,
            PERIOD_1,
            PullUpsertRecord::Period(PeriodRow {
                id: "period_1".to_string(),
                period_schedule_id: "period_schedule_1".to_string(),
                name: "Jan Wk01 2023".to_string(),
                start_date: NaiveDate::from_ymd_opt(2023, 01, 01).unwrap(),
                end_date: NaiveDate::from_ymd_opt(2023, 01, 07).unwrap(),
            }),
        ),
        TestSyncPullRecord::new_pull_upsert(
            LegacyTableName::PERIOD,
            PERIOD_2,
            PullUpsertRecord::Period(PeriodRow {
                id: "period_2".to_string(),
                period_schedule_id: "period_schedule_2".to_string(),
                name: "2023".to_string(),
                start_date: NaiveDate::from_ymd_opt(2023, 01, 01).unwrap(),
                end_date: NaiveDate::from_ymd_opt(2023, 12, 31).unwrap(),
            }),
        ),
        TestSyncPullRecord::new_pull_upsert(
            LegacyTableName::PERIOD,
            PERIOD_3,
            PullUpsertRecord::Period(PeriodRow {
                id: "641A3560C84A44BC9E6DDC01F3D75923".to_string(),
                period_schedule_id: "597074CBCCC24166B8C1F82553DACC2F".to_string(),
                name: "2020_Q2".to_string(),
                start_date: NaiveDate::from_ymd_opt(2020, 04, 01).unwrap(),
                end_date: NaiveDate::from_ymd_opt(2020, 06, 30).unwrap(),
            }),
        ),
        TestSyncPullRecord::new_pull_upsert(
            LegacyTableName::PERIOD,
            PERIOD_4,
            PullUpsertRecord::Period(PeriodRow {
                id: "772B3984DBA14A5F941ED0EF857FDB31".to_string(),
                period_schedule_id: "597074CBCCC24166B8C1F82553DACC2F".to_string(),
                name: "2020_Q3".to_string(),
                start_date: NaiveDate::from_ymd_opt(2020, 07, 01).unwrap(),
                end_date: NaiveDate::from_ymd_opt(2020, 09, 30).unwrap(),
            }),
        ),
    ]
}
