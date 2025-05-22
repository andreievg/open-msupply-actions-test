use repository::name_insurance_join_row::{NameInsuranceJoinRow, NameInsuranceJoinRowRepository};
use repository::{RepositoryError, StorageConnectionManager};

use async_graphql::dataloader::*;
use async_graphql::*;
use std::collections::HashMap;

pub struct NameInsuranceJoinLoader {
    pub connection_manager: StorageConnectionManager,
}

impl Loader<String> for NameInsuranceJoinLoader {
    type Value = NameInsuranceJoinRow;
    type Error = RepositoryError;

    async fn load(&self, ids: &[String]) -> Result<HashMap<String, Self::Value>, Self::Error> {
        let connection = self.connection_manager.connection()?;
        let ids = ids.to_owned();
        let result = actix_rt::task::spawn_blocking(move || {
            let repo = NameInsuranceJoinRowRepository::new(&connection);

            repo.find_many_by_ids(&ids)
        })
        .await
        .unwrap()?;

        Ok(result
            .into_iter()
            .map(|row| (row.id.clone(), row))
            .collect())
    }
}
