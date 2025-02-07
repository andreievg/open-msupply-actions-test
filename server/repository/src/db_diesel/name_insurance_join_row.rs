use super::{
    ChangeLogInsertRow, ChangelogRepository, ChangelogTableName, RowActionType, StorageConnection,
};

use crate::{repository_error::RepositoryError, Upsert};
use diesel::prelude::*;
use diesel_derive_enum::DbEnum;
use serde::{Deserialize, Serialize};

#[derive(DbEnum, Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[DbValueStyle = "SCREAMING_SNAKE_CASE"]
pub enum InsurancePolicyType {
    #[default]
    Personal,
    Business,
}

table! {
  name_insurance_join (id) {
    id -> Text,
    name_link_id -> Text,
    insurance_provider_id -> Text,
    policy_number_person -> Nullable<Text>,
    policy_number_family -> Nullable<Text>,
    policy_number -> Text,
    policy_type -> crate::db_diesel::name_insurance_join_row::InsurancePolicyTypeMapping,
    discount_percentage -> Double,
    expiry_date -> Date,
    is_active -> Bool,
    entered_by_id -> Nullable<Text>,
  }
}

#[derive(
    Clone, Insertable, Queryable, Debug, PartialEq, AsChangeset, Default, Serialize, Deserialize,
)]
#[diesel(table_name = name_insurance_join)]
pub struct NameInsuranceJoinRow {
    pub id: String,
    pub name_link_id: String,
    pub insurance_provider_id: String,
    pub policy_number_person: Option<String>,
    pub policy_number_family: Option<String>,
    pub policy_number: String,
    pub policy_type: InsurancePolicyType,
    pub discount_percentage: f64,
    pub expiry_date: chrono::NaiveDate,
    pub is_active: bool,
    pub entered_by_id: Option<String>,
}

pub struct NameInsuranceJoinRowRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> NameInsuranceJoinRowRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        NameInsuranceJoinRowRepository { connection }
    }

    pub fn find_one_by_id(
        &self,
        id: &str,
    ) -> Result<Option<NameInsuranceJoinRow>, RepositoryError> {
        let result = name_insurance_join::table
            .filter(name_insurance_join::id.eq(id))
            .first(self.connection.lock().connection())
            .optional()?;
        Ok(result)
    }

    pub fn find_many_by_name_link_id(
        &self,
        name_link_id: &str,
    ) -> Result<Vec<NameInsuranceJoinRow>, RepositoryError> {
        let result = name_insurance_join::table
            .filter(name_insurance_join::name_link_id.eq(name_link_id))
            .get_results(self.connection.lock().connection())?;
        Ok(result)
    }

    pub fn upsert_one(&self, row: &NameInsuranceJoinRow) -> Result<i64, RepositoryError> {
        diesel::insert_into(name_insurance_join::table)
            .values(row)
            .on_conflict(name_insurance_join::id)
            .do_update()
            .set(row)
            .execute(self.connection.lock().connection())?;
        self.insert_changelog(&row.id, RowActionType::Upsert)
    }

    fn insert_changelog(&self, uid: &str, action: RowActionType) -> Result<i64, RepositoryError> {
        let row = ChangeLogInsertRow {
            table_name: ChangelogTableName::NameInsuranceJoin,
            record_id: uid.to_string(),
            row_action: action,
            store_id: None,
            name_link_id: None,
        };

        ChangelogRepository::new(self.connection).insert(&row)
    }
}

impl Upsert for NameInsuranceJoinRow {
    fn upsert(&self, con: &StorageConnection) -> Result<Option<i64>, RepositoryError> {
        let change_log = NameInsuranceJoinRowRepository::new(con).upsert_one(self)?;
        Ok(Some(change_log))
    }

    // Test only
    fn assert_upserted(&self, con: &StorageConnection) {
        assert_eq!(
            NameInsuranceJoinRowRepository::new(con).find_one_by_id(&self.id),
            Ok(Some(self.clone()))
        )
    }
}
