use chrono::NaiveDate;

use crate::PeriodRow;
use crate::PeriodScheduleRow;

pub fn mock_period_schedule_1() -> PeriodScheduleRow {
    PeriodScheduleRow {
        id: "mock_period_schedule_1".to_string(),
        name: "Monthly".to_string(),
    }
}

pub fn mock_period_schedule_2() -> PeriodScheduleRow {
    PeriodScheduleRow {
        id: "mock_period_schedule_2".to_string(),
        name: "Weekly".to_string(),
    }
}

pub fn mock_period() -> PeriodRow {
    PeriodRow {
        id: "period_1".to_string(),
        name: "January 2023".to_string(),
        period_schedule_id: "mock_period_schedule_1".to_string(),
        start_date: NaiveDate::from_ymd_opt(2023, 1, 1).unwrap(),
        end_date: NaiveDate::from_ymd_opt(2023, 1, 31).unwrap(),
    }
}

pub fn mock_period_schedules() -> Vec<PeriodScheduleRow> {
    vec![mock_period_schedule_1(), mock_period_schedule_2()]
}

pub fn mock_periods() -> Vec<PeriodRow> {
    vec![mock_period()]
}
