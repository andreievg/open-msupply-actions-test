use repository::{
    asset::{Asset, AssetFilter, AssetRepository},
    asset_internal_location::{AssetInternalLocationFilter, AssetInternalLocationRepository},
    asset_internal_location_row::AssetInternalLocationRow,
    asset_log_reason_row::{AssetLogReasonRow, AssetLogReasonRowRepository},
    asset_log_row::AssetLogStatus,
    asset_property_row::{AssetPropertyRow, AssetPropertyRowRepository},
    assets::{
        asset_log_row::{AssetLogRow, AssetLogRowRepository},
        asset_row::{AssetRow, AssetRowRepository},
    },
    location::{LocationFilter, LocationRepository},
    EqualFilter, RepositoryError, StorageConnection, StringFilter,
};

use super::update::UpdateAssetError;

pub fn check_asset_exists(
    id: &str,
    connection: &StorageConnection,
) -> Result<Option<AssetRow>, RepositoryError> {
    AssetRowRepository::new(connection).find_one_by_id(id)
}

pub fn check_asset_property_exists(
    id: &str,
    connection: &StorageConnection,
) -> Result<Option<AssetPropertyRow>, RepositoryError> {
    AssetPropertyRowRepository::new(connection).find_one_by_id(id)
}

pub fn check_asset_number_exists(
    connection: &StorageConnection,
    asset_number: &str,
    updated_asset_id: Option<String>,
) -> Result<Vec<Asset>, RepositoryError> {
    let mut filter = AssetFilter::new().asset_number(StringFilter::equal_to(asset_number));
    if let Some(updated_asset_id) = updated_asset_id {
        filter = filter.id(EqualFilter::not_equal_to(&updated_asset_id));
    }
    AssetRepository::new(connection).query_by_filter(filter)
}

pub fn check_asset_log_exists(
    id: &str,
    connection: &StorageConnection,
) -> Result<Option<AssetLogRow>, RepositoryError> {
    AssetLogRowRepository::new(connection).find_one_by_id(id)
}

pub fn check_reason_matches_status(
    status: &Option<AssetLogStatus>,
    reason_id: &Option<String>,
    connection: &StorageConnection,
) -> bool {
    if let Some(reason_id) = reason_id {
        match status {
            Some(status) => {
                let reason = AssetLogReasonRowRepository::new(connection).find_one_by_id(reason_id);
                if let Ok(Some(reason)) = reason {
                    return reason.asset_log_status == *status;
                } else {
                    return false;
                }
            }
            None => return false,
        }
    }
    // return true as a default if no reason provided for asset log
    true
}

pub fn check_locations_are_assigned(
    location_ids: Vec<String>,
    asset_id: &str,
    connection: &StorageConnection,
) -> Result<Vec<AssetInternalLocationRow>, RepositoryError> {
    AssetInternalLocationRepository::new(connection).query_by_filter(
        AssetInternalLocationFilter::new()
            .location_id(EqualFilter::equal_any(location_ids))
            .asset_id(EqualFilter::not_equal_to(asset_id)),
    )
}

pub fn check_locations_belong_to_store(
    location_ids: Vec<String>,
    store_id: &str,
    connection: &StorageConnection,
) -> Result<(), UpdateAssetError> {
    let locations = LocationRepository::new(connection).query_by_filter(
        LocationFilter::new()
            .id(EqualFilter::equal_any(location_ids))
            .store_id(EqualFilter::not_equal_to(store_id)),
    )?;
    if !locations.is_empty() {
        return Err(UpdateAssetError::LocationDoesNotBelongToStore);
    }
    Ok(())
}

pub fn check_asset_log_reason_exists(
    id: &str,
    connection: &StorageConnection,
) -> Result<Option<AssetLogReasonRow>, RepositoryError> {
    AssetLogReasonRowRepository::new(connection).find_one_by_id(id)
}
