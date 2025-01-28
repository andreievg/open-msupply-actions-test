use super::{
    temperature_breach_config_row::temperature_breach_config, DBType, StorageConnection,
    TemperatureBreachConfigRow, TemperatureBreachType,
};
use diesel::prelude::*;

use crate::{
    diesel_macros::{apply_equal_filter, apply_sort_no_case},
    repository_error::RepositoryError,
};

use crate::{EqualFilter, Pagination, Sort};

#[derive(PartialEq, Debug, Clone)]
pub struct TemperatureBreachConfig {
    pub temperature_breach_config_row: TemperatureBreachConfigRow,
}

#[derive(Clone, PartialEq, Debug, Default)]
pub struct TemperatureBreachConfigFilter {
    pub id: Option<EqualFilter<String>>,
    pub r#type: Option<EqualFilter<TemperatureBreachType>>,
    pub is_active: Option<bool>,
    pub store_id: Option<EqualFilter<String>>,
    pub duration_milliseconds: Option<EqualFilter<i32>>,
    pub minimum_temperature: Option<EqualFilter<f64>>,
    pub maximum_temperature: Option<EqualFilter<f64>>,
    pub description: Option<EqualFilter<String>>,
}

#[derive(PartialEq, Debug)]
pub enum TemperatureBreachConfigSortField {
    Id,
    Description,
}

pub type TemperatureBreachConfigSort = Sort<TemperatureBreachConfigSortField>;

pub struct TemperatureBreachConfigRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> TemperatureBreachConfigRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        TemperatureBreachConfigRepository { connection }
    }

    pub fn count(
        &self,
        filter: Option<TemperatureBreachConfigFilter>,
    ) -> Result<i64, RepositoryError> {
        let query = create_filtered_query(filter);
        Ok(query
            .count()
            .get_result(self.connection.lock().connection())?)
    }

    pub fn query_by_filter(
        &self,
        filter: TemperatureBreachConfigFilter,
    ) -> Result<Vec<TemperatureBreachConfig>, RepositoryError> {
        self.query(Pagination::all(), Some(filter), None)
    }

    pub fn query(
        &self,
        pagination: Pagination,
        filter: Option<TemperatureBreachConfigFilter>,
        sort: Option<TemperatureBreachConfigSort>,
    ) -> Result<Vec<TemperatureBreachConfig>, RepositoryError> {
        let mut query = create_filtered_query(filter);
        if let Some(sort) = sort {
            match sort.key {
                TemperatureBreachConfigSortField::Id => {
                    apply_sort_no_case!(query, sort, temperature_breach_config::id)
                }
                TemperatureBreachConfigSortField::Description => {
                    apply_sort_no_case!(query, sort, temperature_breach_config::description)
                }
            }
        } else {
            let sort = TemperatureBreachConfigSort {
                key: TemperatureBreachConfigSortField::Description,
                desc: Some(false),
            };
            apply_sort_no_case!(query, sort, temperature_breach_config::description)
        }

        let result = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64)
            .load::<TemperatureBreachConfigRow>(self.connection.lock().connection())?;

        Ok(result.into_iter().map(to_domain).collect())
    }
}

type BoxedLogQuery = temperature_breach_config::BoxedQuery<'static, DBType>;

fn create_filtered_query(filter: Option<TemperatureBreachConfigFilter>) -> BoxedLogQuery {
    let mut query = temperature_breach_config::table.into_boxed();

    if let Some(TemperatureBreachConfigFilter {
        id,
        r#type,
        is_active,
        store_id,
        duration_milliseconds,
        minimum_temperature,
        maximum_temperature,
        description,
    }) = filter
    {
        apply_equal_filter!(query, id, temperature_breach_config::id);
        apply_equal_filter!(query, r#type, temperature_breach_config::type_);
        apply_equal_filter!(
            query,
            duration_milliseconds,
            temperature_breach_config::duration_milliseconds
        );
        apply_equal_filter!(
            query,
            minimum_temperature,
            temperature_breach_config::minimum_temperature
        );
        apply_equal_filter!(
            query,
            maximum_temperature,
            temperature_breach_config::maximum_temperature
        );
        apply_equal_filter!(query, description, temperature_breach_config::description);

        if let Some(value) = is_active {
            query = query.filter(temperature_breach_config::is_active.eq(value));
        }

        apply_equal_filter!(query, store_id, temperature_breach_config::store_id);
    }

    query
}

fn to_domain(temperature_breach_config_row: TemperatureBreachConfigRow) -> TemperatureBreachConfig {
    TemperatureBreachConfig {
        temperature_breach_config_row,
    }
}

impl TemperatureBreachConfigFilter {
    pub fn new() -> TemperatureBreachConfigFilter {
        Self::default()
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn is_active(mut self, filter: bool) -> Self {
        self.is_active = Some(filter);
        self
    }

    pub fn r#type(mut self, filter: EqualFilter<TemperatureBreachType>) -> Self {
        self.r#type = Some(filter);
        self
    }

    pub fn store_id(mut self, filter: EqualFilter<String>) -> Self {
        self.store_id = Some(filter);
        self
    }

    pub fn description(mut self, filter: EqualFilter<String>) -> Self {
        self.description = Some(filter);
        self
    }

    pub fn duration_milliseconds(mut self, filter: EqualFilter<i32>) -> Self {
        self.duration_milliseconds = Some(filter);
        self
    }

    pub fn minimum_temperature(mut self, filter: EqualFilter<f64>) -> Self {
        self.minimum_temperature = Some(filter);
        self
    }

    pub fn maximum_temperature(mut self, filter: EqualFilter<f64>) -> Self {
        self.maximum_temperature = Some(filter);
        self
    }
}
