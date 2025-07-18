use crate::loader::*;
use actix_web::web::Data;
use anymap::{any::Any, Map};
use async_graphql::dataloader::DataLoader;
use diagnosis::DiagnosisLoader;
use item_variant::{ItemVariantByItemVariantIdLoader, ItemVariantsByItemIdLoader};
use repository::StorageConnectionManager;
use service::service_provider::ServiceProvider;

use super::previous_encounter::PreviousEncounterLoader;

pub type LoaderMap = Map<AnyLoader>;
pub type AnyLoader = dyn Any + Send + Sync;

pub struct LoaderRegistry {
    pub loaders: LoaderMap,
}

impl LoaderRegistry {
    pub fn get<T: anymap::any::Any + Send + Sync>(&self) -> &T {
        match self.loaders.get::<T>() {
            Some(loader) => loader,
            None => unreachable!("{} not found", std::any::type_name::<T>()),
        }
    }
}

pub async fn get_loaders(
    connection_manager: &StorageConnectionManager,
    service_provider: Data<ServiceProvider>,
) -> LoaderMap {
    let mut loaders: LoaderMap = LoaderMap::new();

    let item_loader = DataLoader::new(
        ItemLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let store_by_id_loader = DataLoader::new(
        StoreByIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let invoice_by_id_loader = DataLoader::new(
        InvoiceByIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let invoice_by_requisition_id_loader = DataLoader::new(
        InvoiceByRequisitionIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let invoice_line_by_invoice_id_loader = DataLoader::new(
        InvoiceLineByInvoiceIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let invoice_line_for_requisition_line = DataLoader::new(
        InvoiceLineForRequisitionLine {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let invoice_line_stats_loader = DataLoader::new(
        InvoiceStatsLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let stock_line_by_item_id_and_store_id_loader = DataLoader::new(
        StockLineByItemAndStoreIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let stock_line_by_location_id_loader = DataLoader::new(
        StockLineByLocationIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let stock_line_by_id_loader = DataLoader::new(
        StockLineByIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let user_account_loader = DataLoader::new(
        UserLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let name_by_id_loader = DataLoader::new(
        NameByIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );
    let name_by_name_link_id_loader = DataLoader::new(
        NameByNameLinkIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let location_by_id_loader = DataLoader::new(
        LocationByIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let stocktake_line_loader = DataLoader::new(
        StocktakeLineByStocktakeIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let requisitions_by_id_loader = DataLoader::new(
        RequisitionsByIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let requisition_line_by_requisition_id_loader = DataLoader::new(
        RequisitionLinesByRequisitionIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let requisition_line_by_linked_requisition_line_id_loader = DataLoader::new(
        LinkedRequisitionLineLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let item_stats_for_item_loader = DataLoader::new(
        ItemsStatsForItemLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let requisition_line_supply_status_loader = DataLoader::new(
        RequisitionLineSupplyStatusLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let requisition_lines_remaining_to_supply_loader = DataLoader::new(
        RequisitionLinesRemainingToSupplyLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let name_row_loader = DataLoader::new(
        NameRowLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let stock_on_hand = DataLoader::new(
        ItemsStockOnHandLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let schema_loader = DataLoader::new(
        JsonSchemaLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let document_loader = DataLoader::new(
        DocumentLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let doc_registry_loader = DataLoader::new(
        DocumentRegistryLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    let asset_by_location_loader = DataLoader::new(
        AssetByLocationLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let asset_location_loader = DataLoader::new(
        AssetLocationLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let file_sync_reference_loader = DataLoader::new(
        SyncFileReferenceLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let asset_log_reason_loader = DataLoader::new(
        AssetLogReasonLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    );

    let program_indicator_value_loader = DataLoader::new(
        IndicatorValueLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    );

    loaders.insert(item_loader);
    loaders.insert(name_by_id_loader);
    loaders.insert(name_by_name_link_id_loader);
    loaders.insert(store_by_id_loader);
    loaders.insert(invoice_by_id_loader);
    loaders.insert(invoice_by_requisition_id_loader);
    loaders.insert(invoice_line_by_invoice_id_loader);
    loaders.insert(invoice_line_stats_loader);
    loaders.insert(invoice_line_for_requisition_line);
    loaders.insert(stock_line_by_item_id_and_store_id_loader);
    loaders.insert(stock_line_by_location_id_loader);
    loaders.insert(stock_line_by_id_loader);
    loaders.insert(user_account_loader);
    loaders.insert(location_by_id_loader);
    loaders.insert(requisitions_by_id_loader);
    loaders.insert(requisition_line_by_requisition_id_loader);
    loaders.insert(requisition_line_by_linked_requisition_line_id_loader);
    loaders.insert(item_stats_for_item_loader);
    loaders.insert(stocktake_line_loader);
    loaders.insert(requisition_line_supply_status_loader);
    loaders.insert(requisition_lines_remaining_to_supply_loader);
    loaders.insert(name_row_loader);
    loaders.insert(stock_on_hand);
    loaders.insert(document_loader);
    loaders.insert(schema_loader);
    loaders.insert(doc_registry_loader);
    loaders.insert(asset_by_location_loader);
    loaders.insert(asset_location_loader);
    loaders.insert(file_sync_reference_loader);
    loaders.insert(asset_log_reason_loader);
    loaders.insert(program_indicator_value_loader);
    loaders.insert(DataLoader::new(
        PatientLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        ClinicianLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        ProgramEnrolmentLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        DocumentByIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        TemperatureBreachByIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        SensorByIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders.insert(DataLoader::new(
        AssetClassLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        AssetCategoryLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        AssetTypeLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        AssetCatalogueItemLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        AssetStatusLogLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders.insert(DataLoader::new(
        DemographicLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders.insert(DataLoader::new(
        VaccineCourseByProgramIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders.insert(DataLoader::new(
        VaccineCourseItemByVaccineCourseIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders.insert(DataLoader::new(
        VaccineCourseDoseByVaccineCourseIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders.insert(DataLoader::new(
        RnRFormLinesByRnRFormIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders.insert(DataLoader::new(
        VaccineCourseLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        MasterListByItemIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        ReasonOptionLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        ColdStorageTypeLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders.insert(DataLoader::new(
        ItemVariantsByItemIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        ItemVariantByItemVariantIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        PackagingVariantRowLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        BundledItemByBundledItemVariantIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        BundledItemByPrincipalItemVariantIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        ProgramByIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        RequisitionIndicatorInfoLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        DiagnosisLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        PreviousEncounterLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        ItemDirectionsByItemIdLoader {
            service_provider: service_provider.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        InsuranceProviderByIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        NameInsuranceJoinLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        WarningLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        VVMStatusByIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        VVMStatusLogByStockLineIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));
    loaders.insert(DataLoader::new(
        CampaignByIdLoader {
            connection_manager: connection_manager.clone(),
        },
        tokio::spawn,
    ));

    loaders
}
