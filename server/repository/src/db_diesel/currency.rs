use super::{currency_row::currency, CurrencyRow, DBType, StorageConnection};
use diesel::prelude::*;

use crate::{
    diesel_macros::{apply_equal_filter, apply_sort, apply_sort_no_case},
    repository_error::RepositoryError,
};

use crate::{EqualFilter, Sort};

#[derive(PartialEq, Debug, Clone)]
pub struct Currency {
    pub currency_row: CurrencyRow,
}

#[derive(Clone, Default)]
pub struct CurrencyFilter {
    pub id: Option<EqualFilter<String>>,
    pub is_home_currency: Option<bool>,
    pub is_active: Option<bool>,
}

pub enum CurrencySortField {
    Id,
    CurrencyCode,
    IsHomeCurrency,
}

pub type CurrencySort = Sort<CurrencySortField>;

pub struct CurrencyRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> CurrencyRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        CurrencyRepository { connection }
    }

    pub fn count(&self, filter: Option<CurrencyFilter>) -> Result<i64, RepositoryError> {
        let query = create_filtered_query(filter);
        Ok(query
            .count()
            .get_result(self.connection.lock().connection())?)
    }

    pub fn query_by_filter(
        &self,
        filter: CurrencyFilter,
    ) -> Result<Vec<Currency>, RepositoryError> {
        self.query(Some(filter), None)
    }

    pub fn query(
        &self,
        filter: Option<CurrencyFilter>,
        sort: Option<CurrencySort>,
    ) -> Result<Vec<Currency>, RepositoryError> {
        let mut query = create_filtered_query(filter);
        if let Some(sort) = sort {
            match sort.key {
                CurrencySortField::Id => {
                    apply_sort_no_case!(query, sort, currency::id)
                }
                CurrencySortField::CurrencyCode => {
                    apply_sort_no_case!(query, sort, currency::code)
                }
                CurrencySortField::IsHomeCurrency => {
                    apply_sort!(query, sort, currency::is_home_currency)
                }
            }
        } else {
            query = query.order(currency::code.asc())
        }

        let result = query.load::<CurrencyRow>(self.connection.lock().connection())?;

        Ok(result.into_iter().map(to_domain).collect())
    }
}

type BoxedLogQuery = currency::BoxedQuery<'static, DBType>;

fn create_filtered_query(filter: Option<CurrencyFilter>) -> BoxedLogQuery {
    let mut query = currency::table.into_boxed();

    if let Some(filter) = filter {
        apply_equal_filter!(query, filter.id, currency::id);

        query = match filter.is_home_currency {
            Some(true) => query.filter(currency::is_home_currency.eq(true)),
            Some(false) => query.filter(currency::is_home_currency.eq(false)),
            None => query,
        };

        if let Some(is_active) = filter.is_active {
            query = query.filter(currency::is_active.eq(is_active))
        }
    }
    query
}

pub fn to_domain(currency_row: CurrencyRow) -> Currency {
    Currency { currency_row }
}

impl CurrencyFilter {
    pub fn new() -> CurrencyFilter {
        Self::default()
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn is_home_currency(mut self, filter: bool) -> Self {
        self.is_home_currency = Some(filter);
        self
    }

    pub fn is_active(mut self, filter: bool) -> Self {
        self.is_active = Some(filter);
        self
    }
}
