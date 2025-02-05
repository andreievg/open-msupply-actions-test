use super::{location_row::location::dsl as location_dsl, store_row::store, StorageConnection};

use crate::repository_error::RepositoryError;

use diesel::prelude::*;

table! {
    location (id) {
        id -> Text,
        name -> Text,
        code -> Text,
        on_hold -> Bool,
        store_id -> Text,
    }
}

joinable!(location -> store (store_id));

#[derive(Clone, Queryable, Insertable, AsChangeset, Debug, PartialEq, Default)]
#[table_name = "location"]
pub struct LocationRow {
    pub id: String,
    pub name: String,
    pub code: String,
    pub on_hold: bool,
    pub store_id: String,
}

pub struct LocationRowRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> LocationRowRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        LocationRowRepository { connection }
    }

    #[cfg(feature = "postgres")]
    pub fn upsert_one(&self, row: &LocationRow) -> Result<(), RepositoryError> {
        diesel::insert_into(location_dsl::location)
            .values(row)
            .on_conflict(location_dsl::id)
            .do_update()
            .set(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    #[cfg(not(feature = "postgres"))]
    pub fn upsert_one(&self, row: &LocationRow) -> Result<(), RepositoryError> {
        diesel::replace_into(location_dsl::location)
            .values(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    pub fn find_one_by_id(&self, id: &str) -> Result<Option<LocationRow>, RepositoryError> {
        match location_dsl::location
            .filter(location_dsl::id.eq(id))
            .first(&self.connection.connection)
        {
            Ok(row) => Ok(Some(row)),
            Err(diesel::result::Error::NotFound) => Ok(None),
            Err(error) => Err(RepositoryError::from(error)),
        }
    }

    pub fn find_many_by_id(&self, ids: &[String]) -> Result<Vec<LocationRow>, RepositoryError> {
        Ok(location_dsl::location
            .filter(location_dsl::id.eq_any(ids))
            .load(&self.connection.connection)?)
    }

    pub fn delete(&self, id: &str) -> Result<(), RepositoryError> {
        diesel::delete(location_dsl::location.filter(location_dsl::id.eq(id)))
            .execute(&self.connection.connection)?;
        Ok(())
    }
}
