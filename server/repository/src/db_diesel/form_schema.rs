use super::StorageConnection;

use crate::RepositoryError;

use diesel::prelude::*;
use serde::{Deserialize, Serialize};

table! {
    form_schema (id) {
        id -> Text,
        #[sql_name = "type"] type_ -> Text,
        json_schema -> Text,
        ui_schema -> Text,
    }
}

#[derive(Clone, Queryable, Insertable, AsChangeset, Debug, PartialEq)]
#[table_name = "form_schema"]
pub struct JSONSchemaRow {
    /// The json schema id
    pub id: String,
    #[column_name = "type_"]
    pub r#type: String,
    pub json_schema: String,
    pub ui_schema: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JSONSchema {
    pub id: String,
    pub r#type: String,
    pub json_schema: serde_json::Value,
    pub ui_schema: serde_json::Value,
}

pub struct JsonSchemaRepository<'a> {
    connection: &'a StorageConnection,
}

fn schema_from_row(schema_row: JSONSchemaRow) -> Result<JSONSchema, RepositoryError> {
    let json_schema: serde_json::Value =
        serde_json::from_str(&schema_row.json_schema).map_err(|err| RepositoryError::DBError {
            msg: "Can't deserialize json schema".to_string(),
            extra: format!("{}", err),
        })?;
    let ui_schema: serde_json::Value =
        serde_json::from_str(&schema_row.ui_schema).map_err(|err| RepositoryError::DBError {
            msg: "Can't deserialize json schema".to_string(),
            extra: format!("{}", err),
        })?;
    Ok(JSONSchema {
        id: schema_row.id,
        r#type: schema_row.r#type,
        json_schema,
        ui_schema,
    })
}

fn row_from_schema(schema: &JSONSchema) -> Result<JSONSchemaRow, RepositoryError> {
    let json_schema =
        serde_json::to_string(&schema.json_schema).map_err(|err| RepositoryError::DBError {
            msg: "Can't serialize json schema".to_string(),
            extra: format!("{}", err),
        })?;
    let ui_schema =
        serde_json::to_string(&schema.ui_schema).map_err(|err| RepositoryError::DBError {
            msg: "Can't serialize ui schema".to_string(),
            extra: format!("{}", err),
        })?;
    Ok(JSONSchemaRow {
        id: schema.id.to_owned(),
        r#type: schema.r#type.to_owned(),
        json_schema,
        ui_schema,
    })
}

impl<'a> JsonSchemaRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        JsonSchemaRepository { connection }
    }

    #[cfg(feature = "postgres")]
    pub fn upsert_one(&self, schema: &JSONSchema) -> Result<(), RepositoryError> {
        let row = row_from_schema(schema)?;
        diesel::insert_into(form_schema::dsl::form_schema)
            .values(&row)
            .on_conflict(form_schema::dsl::id)
            .do_update()
            .set(&row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    #[cfg(not(feature = "postgres"))]
    pub fn upsert_one(&self, schema: &JSONSchema) -> Result<(), RepositoryError> {
        let row = row_from_schema(schema)?;
        diesel::replace_into(form_schema::dsl::form_schema)
            .values(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    pub fn find_one_by_id(&self, schema_id: &str) -> Result<JSONSchema, RepositoryError> {
        let row = form_schema::dsl::form_schema
            .filter(form_schema::dsl::id.eq(schema_id))
            .first(&self.connection.connection)?;

        schema_from_row(row)
    }

    pub fn find_many_by_ids(&self, ids: &[String]) -> Result<Vec<JSONSchema>, RepositoryError> {
        let rows: Vec<JSONSchemaRow> = form_schema::dsl::form_schema
            .filter(form_schema::dsl::id.eq_any(ids))
            .load(&self.connection.connection)?;
        let mut result = Vec::<JSONSchema>::new();
        for row in rows {
            result.push(schema_from_row(row)?);
        }
        Ok(result)
    }
}
