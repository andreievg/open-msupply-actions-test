use chrono::{NaiveDate, NaiveDateTime};
use util::inline_init;

#[derive(Clone, PartialEq, Debug)]
pub struct SimpleStringFilter {
    pub equal_to: Option<String>,
    pub like: Option<String>,
}

impl SimpleStringFilter {
    pub fn equal_to(value: &str) -> Self {
        SimpleStringFilter {
            equal_to: Some(value.to_owned()),
            like: None,
        }
    }

    pub fn like(value: &str) -> Self {
        SimpleStringFilter {
            equal_to: None,
            like: Some(value.to_owned()),
        }
    }
}

#[derive(Clone, PartialEq, Debug)]
pub struct EqualFilter<T> {
    pub equal_to: Option<T>,
    pub not_equal_to: Option<T>,
    pub equal_any: Option<Vec<T>>,
    pub equal_any_or_null: Option<Vec<T>>,
    pub not_equal_all: Option<Vec<T>>,
    pub is_null: Option<bool>,
}

impl<T> Default for EqualFilter<T> {
    fn default() -> Self {
        Self {
            equal_to: None,
            not_equal_to: None,
            equal_any: None,
            equal_any_or_null: None,
            not_equal_all: None,
            is_null: None,
        }
    }
}

impl EqualFilter<bool> {
    pub fn equal_or_null_bool(value: bool) -> Self {
        Self {
            equal_any_or_null: Some(vec![value]),
            ..Default::default()
        }
    }
}

impl EqualFilter<i64> {
    pub fn equal_to_i64(value: i64) -> Self {
        inline_init(|r: &mut Self| r.equal_to = Some(value))
    }
}

impl EqualFilter<i32> {
    pub fn equal_to_i32(value: i32) -> Self {
        inline_init(|r: &mut Self| r.equal_to = Some(value))
    }
    pub fn not_equal_to_i32(value: i32) -> Self {
        inline_init(|r: &mut Self| r.not_equal_to = Some(value))
    }
}

impl EqualFilter<f64> {
    pub fn equal_to_f64(value: f64) -> Self {
        inline_init(|r: &mut Self| r.equal_to = Some(value))
    }

    pub fn not_equal_to_f64(value: f64) -> Self {
        inline_init(|r: &mut Self| r.not_equal_to = Some(value))
    }
}

impl EqualFilter<String> {
    pub fn equal_to(value: &str) -> Self {
        inline_init(|r: &mut Self| r.equal_to = Some(value.to_owned()))
    }

    pub fn not_equal_to(value: &str) -> Self {
        inline_init(|r: &mut Self| r.not_equal_to = Some(value.to_owned()))
    }

    pub fn equal_any(value: Vec<String>) -> Self {
        inline_init(|r: &mut Self| r.equal_any = Some(value))
    }

    pub fn equal_any_or_null(value: Vec<String>) -> Self {
        inline_init(|r: &mut Self| r.equal_any_or_null = Some(value))
    }

    pub fn not_equal_all(value: Vec<String>) -> Self {
        inline_init(|r: &mut Self| r.not_equal_all = Some(value))
    }

    pub fn is_null(value: bool) -> Self {
        inline_init(|r: &mut Self| r.is_null = Some(value))
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct DatetimeFilter {
    pub equal_to: Option<NaiveDateTime>,
    pub before_or_equal_to: Option<NaiveDateTime>,
    pub after_or_equal_to: Option<NaiveDateTime>,
    pub is_null: Option<bool>,
}

impl DatetimeFilter {
    pub fn date_range(from: NaiveDateTime, to: NaiveDateTime) -> DatetimeFilter {
        DatetimeFilter {
            equal_to: None,
            after_or_equal_to: Some(from),
            before_or_equal_to: Some(to),
            is_null: None,
        }
    }

    pub fn equal_to(value: NaiveDateTime) -> Self {
        DatetimeFilter {
            equal_to: Some(value.to_owned()),
            after_or_equal_to: None,
            before_or_equal_to: None,
            is_null: None,
        }
    }

    pub fn after_or_equal_to(value: NaiveDateTime) -> Self {
        DatetimeFilter {
            equal_to: None,
            after_or_equal_to: Some(value.to_owned()),
            before_or_equal_to: None,
            is_null: None,
        }
    }

    pub fn before_or_equal_to(value: NaiveDateTime) -> Self {
        DatetimeFilter {
            equal_to: None,
            after_or_equal_to: None,
            before_or_equal_to: Some(value),
            is_null: None,
        }
    }

    pub fn is_null(value: bool) -> Self {
        DatetimeFilter {
            equal_to: None,
            after_or_equal_to: None,
            before_or_equal_to: None,
            is_null: Some(value),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct DateFilter {
    pub equal_to: Option<NaiveDate>,
    pub before_or_equal_to: Option<NaiveDate>,
    pub after_or_equal_to: Option<NaiveDate>,
}

impl DateFilter {
    pub fn date_range(from: &NaiveDate, to: &NaiveDate) -> DateFilter {
        DateFilter {
            equal_to: None,
            after_or_equal_to: Some(from.clone()),
            before_or_equal_to: Some(to.clone()),
        }
    }

    pub fn after_or_equal_to(value: NaiveDate) -> Self {
        DateFilter {
            equal_to: None,
            after_or_equal_to: Some(value.to_owned()),
            before_or_equal_to: None,
        }
    }

    pub fn equal_to(value: NaiveDate) -> Self {
        DateFilter {
            equal_to: Some(value.to_owned()),
            after_or_equal_to: None,
            before_or_equal_to: None,
        }
    }

    pub fn before_or_equal_to(value: NaiveDate) -> Self {
        DateFilter {
            equal_to: None,
            after_or_equal_to: None,
            before_or_equal_to: Some(value),
        }
    }
}

#[derive(PartialEq, Debug)]
pub struct Sort<T> {
    pub key: T,
    pub desc: Option<bool>,
}

pub const DEFAULT_PAGINATION_LIMIT: u32 = 100;

#[derive(Debug, PartialEq)]
pub struct PaginationOption {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

pub struct Pagination {
    pub limit: u32,
    pub offset: u32,
}

impl Pagination {
    pub fn new() -> Pagination {
        Pagination {
            offset: 0,
            limit: DEFAULT_PAGINATION_LIMIT,
        }
    }

    pub fn all() -> Pagination {
        Pagination {
            offset: 0,
            limit: std::u32::MAX,
        }
    }

    pub fn one() -> Pagination {
        Pagination {
            offset: 0,
            limit: 1,
        }
    }
}
