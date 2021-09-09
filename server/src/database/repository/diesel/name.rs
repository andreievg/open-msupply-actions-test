use super::{DBBackendConnection, DBConnection};

use crate::database::{
    repository::{repository::get_connection, RepositoryError},
    schema::NameRow,
};

use diesel::{
    prelude::*,
    r2d2::{ConnectionManager, Pool},
};

#[derive(Clone)]
pub struct NameRepository {
    pool: Pool<ConnectionManager<DBBackendConnection>>,
}

impl NameRepository {
    pub fn new(pool: Pool<ConnectionManager<DBBackendConnection>>) -> NameRepository {
        NameRepository { pool }
    }

    pub fn insert_one_tx(
        connection: &DBConnection,
        name_row: &NameRow,
    ) -> Result<(), RepositoryError> {
        use crate::database::schema::diesel_schema::name_table::dsl::*;
        diesel::insert_into(name_table)
            .values(name_row)
            .execute(connection)?;
        Ok(())
    }

    #[cfg(feature = "postgres")]
    pub fn upsert_one_tx(
        connection: &DBConnection,
        name_row: &NameRow,
    ) -> Result<(), RepositoryError> {
        use crate::database::schema::diesel_schema::name_table::dsl::*;

        diesel::insert_into(name_table)
            .values(name_row)
            .on_conflict(id)
            .do_update()
            .set(name_row)
            .execute(connection)?;
        Ok(())
    }

    #[cfg(feature = "sqlite")]
    pub fn upsert_one_tx(
        connection: &DBConnection,
        name_row: &NameRow,
    ) -> Result<(), RepositoryError> {
        use crate::database::schema::diesel_schema::name_table::dsl::*;
        diesel::replace_into(name_table)
            .values(name_row)
            .execute(connection)?;
        Ok(())
    }

    pub fn find_one_by_id_tx(
        connection: &DBConnection,
        name_id: &str,
    ) -> Result<NameRow, RepositoryError> {
        use crate::database::schema::diesel_schema::name_table::dsl::*;
        let result = name_table.filter(id.eq(name_id)).first(connection)?;
        Ok(result)
    }

    pub fn find_many_by_id_tx<'a>(
        connection: &'a DBConnection,
        ids: &[String],
    ) -> Result<Vec<NameRow>, RepositoryError> {
        use crate::database::schema::diesel_schema::name_table::dsl::*;
        let result = name_table.filter(id.eq_any(ids)).load(connection)?;
        Ok(result)
    }

    pub async fn insert_one(&self, name_row: &NameRow) -> Result<(), RepositoryError> {
        let connection = get_connection(&self.pool)?;
        NameRepository::insert_one_tx(&connection, name_row)?;
        Ok(())
    }

    pub async fn find_one_by_id(&self, name_id: &str) -> Result<NameRow, RepositoryError> {
        let connection = get_connection(&self.pool)?;
        NameRepository::find_one_by_id_tx(&connection, name_id)
    }

    pub async fn find_many_by_id(&self, ids: &[String]) -> Result<Vec<NameRow>, RepositoryError> {
        let connection = get_connection(&self.pool)?;
        NameRepository::find_many_by_id_tx(&connection, ids)
    }
}
