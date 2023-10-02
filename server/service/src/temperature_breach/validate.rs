use chrono::NaiveDateTime;
use repository::{
    temperature_breach::{TemperatureBreachFilter, TemperatureBreachRepository},
    RepositoryError, StorageConnection, TemperatureBreachRow, TemperatureBreachRowRepository,
};
use repository::{DatetimeFilter, EqualFilter};

pub fn check_temperature_breach_exists(
    id: &str,
    connection: &StorageConnection,
) -> Result<Option<TemperatureBreachRow>, RepositoryError> {
    Ok(TemperatureBreachRowRepository::new(connection).find_one_by_id(id)?)
}

pub fn check_temperature_breach_is_unique(
    id: &str,
    sensor_id: &str,
    start_timestamp: NaiveDateTime,
    end_timestamp: NaiveDateTime,
    //r#type: &TemperatureBreachRowType,
    connection: &StorageConnection,
) -> Result<bool, RepositoryError> {
    let temperature_breaches = TemperatureBreachRepository::new(connection).query_by_filter(
        TemperatureBreachFilter::new()
            .sensor_id(EqualFilter::equal_to(sensor_id))
            .id(EqualFilter::not_equal_to(id))
            .start_timestamp(DatetimeFilter::equal_to(start_timestamp))
            .end_timestamp(DatetimeFilter::equal_to(end_timestamp))
            .store_id(EqualFilter::equal_to("store_a")),
    )?;

    //.r#type(TemperatureBreachRowType::ColdConsecutive.equal_to())
    Ok(temperature_breaches.len() == 0)
}
