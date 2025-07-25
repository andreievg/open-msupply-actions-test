use crate::repository_error::RepositoryError;

pub mod abbreviation;
pub mod abbreviation_row;
pub mod activity_log;
mod activity_log_row;
pub mod adjustment;
pub mod assets;
pub mod backend_plugin_row;
pub mod barcode;
mod barcode_row;
pub mod campaign;
pub mod category_row;
pub mod changelog;
pub mod clinician;
mod clinician_link_row;
mod clinician_row;
mod clinician_store_join_row;
pub mod cold_storage_type;
mod cold_storage_type_row;
pub mod consumption;
pub mod contact_form;
pub mod contact_form_row;
pub mod contact_trace;
pub mod contact_trace_row;
mod context_row;
pub mod currency;
mod currency_row;
pub mod demographic;
pub mod demographic_indicator;
pub mod demographic_indicator_row;
pub mod demographic_projection;
pub mod demographic_projection_row;
pub mod demographic_row;
pub mod diagnosis;
pub mod diagnosis_row;
pub mod diesel_schema;
pub mod document;
pub mod document_registry;
mod document_registry_config;
mod document_registry_row;
pub mod email_queue_row;
pub mod encounter;
pub mod encounter_row;
mod filter_restriction;
mod filter_sort_pagination;
pub mod form_schema;
mod form_schema_row;
mod frontend_plugin_row;
pub mod indicator_column;
mod indicator_column_row;
pub mod indicator_line;
mod indicator_line_row;
pub mod indicator_value;
mod indicator_value_row;
pub mod insurance_provider_row;
pub mod invoice;
pub mod invoice_line;
mod invoice_line_row;
mod invoice_row;
pub mod item;
pub mod item_category;
pub mod item_category_row;
pub mod item_direction;
pub mod item_direction_row;
mod item_link_row;
mod item_row;
pub mod item_variant;
pub mod item_warning_join;
pub mod item_warning_join_row;
pub mod key_value_store;
pub mod ledger;
pub mod location;
pub mod location_movement;
mod location_movement_row;
mod location_row;
pub mod master_list;
pub mod master_list_line;
mod master_list_line_row;
pub mod master_list_name_join;
mod master_list_row;
mod migration_fragment_log;
pub mod name;
pub mod name_insurance_join_row;
mod name_link_row;
pub mod name_property;
pub mod name_property_row;
mod name_row;
pub mod name_store_join;
pub mod name_tag;
pub mod name_tag_join;
mod name_tag_row;
mod number_row;
mod patient;
pub mod period;
pub mod plugin_data;
mod plugin_data_row;
pub mod preference;
mod preference_row;
pub mod printer;
pub mod printer_row;
pub mod program_enrolment;
mod program_enrolment_row;
pub mod program_event;
mod program_event_row;
pub mod program_indicator;
mod program_indicator_row;
mod program_requisition;
pub mod property;
pub mod property_row;
pub mod reason_option;
pub mod reason_option_row;
pub mod replenishment;
pub mod report;
mod report_query;
mod report_row;
pub mod requisition;
pub mod requisition_line;
pub mod rnr_form;
pub mod rnr_form_line;
pub mod rnr_form_line_row;
pub mod rnr_form_row;
pub mod sensor;
mod sensor_row;
pub mod stock_line;
mod stock_line_row;
pub mod stock_movement;
pub mod stock_on_hand;
pub mod stocktake;
pub mod stocktake_line;
mod stocktake_line_row;
mod stocktake_row;
mod storage_connection;
pub mod store;
mod store_preference_row;
mod store_row;
pub mod sync_buffer;
pub mod sync_file_reference;
pub mod sync_file_reference_row;
pub mod sync_log;
mod sync_log_row;
pub mod sync_message_row;
pub mod system_log_row;
pub mod temperature_breach;
pub mod temperature_breach_config;
mod temperature_breach_config_row;
mod temperature_breach_row;
mod temperature_excursion;
pub mod temperature_log;
mod temperature_log_row;
mod unit_row;
mod user;
pub mod user_permission;
mod user_permission_row;
mod user_row;
mod user_store_join_row;
pub mod vaccination;
pub mod vaccination_card;
pub mod vaccination_course;
pub mod vaccination_row;
pub mod vaccine_course;
pub mod vvm_status;
pub mod warning;
pub mod warning_row;

pub use abbreviation_row::*;
pub use activity_log_row::*;
pub use adjustment::*;
pub use assets::*;
pub use backend_plugin_row::*;
pub use barcode_row::*;
pub use campaign::*;
pub use changelog::*;
pub use clinician::*;
pub use clinician_link_row::*;
pub use clinician_row::*;
pub use clinician_store_join_row::*;
pub use cold_storage_type::*;
pub use cold_storage_type_row::*;
pub use consumption::*;
pub use context_row::*;
pub use currency::*;
pub use currency_row::*;
pub use demographic_indicator::*;
pub use demographic_indicator_row::*;
pub use demographic_projection_row::*;
pub use demographic_row::*;
pub use diagnosis_row::*;
pub use document::*;
pub use document_registry::*;
pub use document_registry_config::*;
pub use document_registry_row::*;
pub use encounter::*;
pub use encounter_row::*;
pub use filter_sort_pagination::*;
pub use form_schema::*;
pub use form_schema_row::*;
pub use frontend_plugin_row::*;
pub use indicator_column_row::*;
pub use indicator_line_row::*;
pub use indicator_value_row::*;
pub use insurance_provider_row::*;
pub use invoice::*;
pub use invoice_line::*;
pub use invoice_line_row::*;
pub use invoice_row::*;
pub use item::*;
pub use item_direction_row::*;
pub use item_link_row::*;
pub use item_row::*;
pub use item_warning_join::*;
pub use item_warning_join_row::*;
pub use key_value_store::*;
pub use location_movement_row::*;
pub use location_row::*;
pub use master_list::*;
pub use master_list_line::*;
pub use master_list_line_row::*;
pub use master_list_name_join::*;
pub use master_list_row::*;
pub(crate) use migration_fragment_log::*;
pub use name::*;
pub use name_link_row::*;
pub use name_property::*;
pub use name_property_row::*;
pub use name_row::*;
pub use name_store_join::*;
pub use name_tag::*;
pub use name_tag_join::*;
pub use name_tag_row::*;
pub use number_row::*;
pub use patient::*;
pub use period::*;
pub use plugin_data::*;
pub use plugin_data_row::*;
pub use preference::*;
pub use preference_row::*;
pub use printer_row::*;
pub use program_enrolment::*;
pub use program_enrolment_row::*;
pub use program_event::*;
pub use program_event_row::*;
pub use program_indicator::*;
pub use program_indicator_row::*;
pub use program_requisition::*;
pub use property_row::*;
pub use reason_option::*;
pub use reason_option_row::*;
pub use replenishment::*;
pub use report::*;
pub use report_query::*;
pub use report_row::*;
pub use requisition::*;
pub use requisition_line::*;
pub use rnr_form::*;
pub use rnr_form_line::*;
pub use rnr_form_line_row::*;
pub use rnr_form_row::*;
pub use sensor::*;
pub use sensor_row::*;
pub use stock_line::*;
pub use stock_line_row::*;
pub use stock_movement::*;
pub use stock_on_hand::*;
pub use stocktake::*;
pub use stocktake_line::*;
pub use stocktake_line_row::*;
pub use stocktake_row::*;
pub use storage_connection::*;
pub use store::*;
pub use store_preference_row::*;
pub use store_row::*;
pub use sync_buffer::*;
pub use sync_file_reference::*;
pub use sync_file_reference_row::*;
pub use sync_log::*;
pub use sync_log_row::*;
pub use sync_message_row::*;
pub use temperature_breach::*;
pub use temperature_breach_config::*;
pub use temperature_breach_config_row::*;
pub use temperature_breach_row::*;
pub use temperature_excursion::*;
pub use temperature_log::*;
pub use temperature_log_row::*;
pub use unit_row::*;
pub use user::*;
pub use user_permission::*;
pub use user_permission_row::*;
pub use user_row::*;
pub use user_store_join_row::*;
pub use vaccination::*;
pub use vaccination_card::*;
pub use vaccination_course::*;
pub use vaccination_row::*;
pub use warning::*;
pub use warning_row::*;

use diesel::{
    prelude::*,
    r2d2::{ConnectionManager, Pool, PooledConnection},
    result::{DatabaseErrorKind as DieselDatabaseErrorKind, Error as DieselError},
    sql_query,
    sql_types::Text,
};

#[cfg(not(feature = "postgres"))]
pub type DBBackendConnection = SqliteConnection;

#[cfg(feature = "postgres")]
pub type DBBackendConnection = PgConnection;

#[cfg(not(feature = "postgres"))]
pub type DBType = diesel::sqlite::Sqlite;

#[cfg(feature = "postgres")]
pub type DBType = diesel::pg::Pg;

pub type DBConnection = PooledConnection<ConnectionManager<DBBackendConnection>>;

impl From<DieselError> for RepositoryError {
    fn from(err: DieselError) -> Self {
        use RepositoryError as Error;
        match err {
            DieselError::InvalidCString(extra) => {
                Error::as_db_error("DIESEL_INVALID_C_STRING", extra)
            }
            DieselError::DatabaseError(err, extra) => {
                let extra = format!(
                    "{} {} {} {} {} {} {}",
                    extra.message(),
                    extra.details().unwrap_or_default(),
                    extra.hint().unwrap_or_default(),
                    extra.table_name().unwrap_or_default(),
                    extra.column_name().unwrap_or_default(),
                    extra.constraint_name().unwrap_or_default(),
                    extra.statement_position().unwrap_or_default(),
                );
                match err {
                    DieselDatabaseErrorKind::UniqueViolation => Error::UniqueViolation(extra),
                    DieselDatabaseErrorKind::ForeignKeyViolation => {
                        Error::ForeignKeyViolation(extra)
                    }
                    DieselDatabaseErrorKind::UnableToSendCommand => {
                        Error::as_db_error("UNABLE_TO_SEND_COMMAND", extra)
                    }
                    DieselDatabaseErrorKind::SerializationFailure => {
                        Error::as_db_error("SERIALIZATION_FAILURE", extra)
                    }
                    _ => Error::as_db_error("UNKNOWN", extra),
                }
            }
            DieselError::NotFound => RepositoryError::NotFound,
            DieselError::QueryBuilderError(extra) => {
                Error::as_db_error("DIESEL_QUERY_BUILDER_ERROR", extra)
            }
            DieselError::DeserializationError(extra) => {
                Error::as_db_error("DIESEL_DESERIALIZATION_ERROR", extra)
            }
            DieselError::SerializationError(extra) => {
                Error::as_db_error("DIESEL_SERIALIZATION_ERROR", extra)
            }
            DieselError::RollbackTransaction => {
                Error::as_db_error("DIESEL_ROLLBACK_TRANSACTION", "")
            }
            DieselError::AlreadyInTransaction => {
                Error::as_db_error("DIESEL_ALREADY_IN_TRANSACTION", "")
            }
            _ => {
                // try to get a more detailed diesel msg:
                let diesel_msg = format!("{}", err);
                Error::as_db_error("DIESEL_UNKNOWN", diesel_msg)
            }
        }
    }
}

fn get_connection(
    pool: &Pool<ConnectionManager<DBBackendConnection>>,
) -> Result<DBConnection, RepositoryError> {
    pool.get().map_err(|error| RepositoryError::DBError {
        msg: "Failed to open Connection".to_string(),
        extra: format!("{:?}", error),
    })
}

#[derive(QueryableByName, Debug, PartialEq)]
pub struct JsonRawRow {
    #[diesel(sql_type = Text)]
    pub json_row: String,
}
// TODO should accept parameters
pub fn raw_query(
    connection: &StorageConnection,
    query: String,
) -> Result<Vec<JsonRawRow>, RepositoryError> {
    Ok(sql_query(&query).get_results::<JsonRawRow>(connection.lock().connection())?)
}
