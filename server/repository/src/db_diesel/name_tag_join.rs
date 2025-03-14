use super::{name_tag_join::name_tag_join::dsl as name_tag_join_dsl, StorageConnection};
use crate::{db_diesel::name_row::name, repository_error::RepositoryError};

use diesel::prelude::*;

table! {
    name_tag_join (id) {
        id -> Text,
        name_id -> Text,
        name_tag_id -> Text,
    }
}

#[derive(Clone, Queryable, Insertable, Debug, PartialEq, Eq, AsChangeset, Default)]
#[table_name = "name_tag_join"]
pub struct NameTagJoinRow {
    pub id: String,
    pub name_id: String,
    pub name_tag_id: String,
}

joinable!(name_tag_join -> name (name_id));

pub struct NameTagJoinRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> NameTagJoinRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        NameTagJoinRepository { connection }
    }

    #[cfg(feature = "postgres")]
    pub fn upsert_one(&self, row: &NameTagJoinRow) -> Result<(), RepositoryError> {
        diesel::insert_into(name_tag_join_dsl::name_tag_join)
            .values(row)
            .on_conflict(name_tag_join_dsl::id)
            .do_update()
            .set(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    #[cfg(not(feature = "postgres"))]
    pub fn upsert_one(&self, row: &NameTagJoinRow) -> Result<(), RepositoryError> {
        diesel::replace_into(name_tag_join_dsl::name_tag_join)
            .values(row)
            .execute(&self.connection.connection)?;
        Ok(())
    }

    pub fn find_one_by_id(&self, id: &str) -> Result<Option<NameTagJoinRow>, RepositoryError> {
        let result = name_tag_join_dsl::name_tag_join
            .filter(name_tag_join_dsl::id.eq(id))
            .first(&self.connection.connection)
            .optional()?;
        Ok(result)
    }

    pub fn delete(&self, id: &str) -> Result<(), RepositoryError> {
        diesel::delete(name_tag_join_dsl::name_tag_join.filter(name_tag_join_dsl::id.eq(id)))
            .execute(&self.connection.connection)?;
        Ok(())
    }
}

#[cfg(test)]
mod test_name_tag_row {
    use crate::{
        mock::{MockData, MockDataInserts},
        test_db::setup_all_with_data,
        NameRow, NameTagJoinRepository, NameTagJoinRow, NameTagRow, NameTagRowRepository,
    };

    #[actix_rt::test]
    async fn test_name_tag_join_repository() {
        let (_, connection, _, _) = setup_all_with_data(
            "omsupply-database-test_name_tag_join_repository",
            MockDataInserts::none(),
            MockData {
                names: vec![NameRow {
                    id: "name1".to_string(),
                    ..Default::default()
                }],

                ..Default::default()
            },
        )
        .await;

        /* TESTS */

        let name_tag_repo = NameTagRowRepository::new(&connection);

        // Check we can insert a name tag
        let name_tag_row = NameTagRow {
            id: "tag_name_id".to_string(),
            name: "tag1".to_string(),
        };

        name_tag_repo.upsert_one(&name_tag_row).unwrap();

        let repo = NameTagJoinRepository::new(&connection);

        // Check we can insert a name tag join
        let name_tag_join_row = NameTagJoinRow {
            id: "name_tag_join_id".to_string(),
            name_id: "name1".to_string(),
            name_tag_id: name_tag_row.id.clone(),
        };
        repo.upsert_one(&name_tag_join_row).unwrap();

        // Check we can find a name tag join
        let found_name_tag_join_row = repo.find_one_by_id(&name_tag_join_row.id).unwrap();
        assert_eq!(found_name_tag_join_row, Some(name_tag_join_row));
    }
}
