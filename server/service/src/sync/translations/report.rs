use crate::sync::sync_serde::empty_str_as_option_string;
use repository::{ReportContext, ReportRow, ReportType, StorageConnection, SyncBufferRow};

use serde::{Deserialize, Serialize};

use super::{
    IntegrationRecords, LegacyTableName, PullDeleteRecordTable, PullUpsertRecord, SyncTranslation,
};

#[derive(Deserialize, Serialize, Debug, PartialEq)]
pub enum LegacyReportEditor {
    #[serde(rename = "omsupply")]
    OmSupply,
    #[serde(other)]
    Others,
}

#[derive(Deserialize, Serialize, Debug, PartialEq)]
pub enum LegacyReportContext {
    #[serde(rename = "Customer Invoice")]
    CustomerInvoice,
    #[serde(rename = "Supplier Invoice")]
    SupplierInvoice,
    #[serde(rename = "Requisition")]
    Requisition,
    #[serde(rename = "Stock Take")]
    Stocktake,

    #[serde(other)]
    Others,
}

#[allow(non_snake_case)]
#[derive(Deserialize, Serialize)]
pub struct LegacyReportRow {
    #[serde(rename = "ID")]
    pub id: String,
    pub report_name: String,
    pub editor: LegacyReportEditor,
    pub context: LegacyReportContext,
    pub template: String,

    #[serde(deserialize_with = "empty_str_as_option_string")]
    #[serde(rename = "Comment")]
    pub comment: Option<String>,
}

fn match_pull_table(sync_record: &SyncBufferRow) -> bool {
    sync_record.table_name == LegacyTableName::REPORT
}

pub(crate) struct ReportTranslation {}
impl SyncTranslation for ReportTranslation {
    fn try_translate_pull_upsert(
        &self,
        _: &StorageConnection,
        sync_record: &SyncBufferRow,
    ) -> Result<Option<IntegrationRecords>, anyhow::Error> {
        if !match_pull_table(sync_record) {
            return Ok(None);
        }

        let data = serde_json::from_str::<LegacyReportRow>(&sync_record.data)?;

        let r#type = match data.editor {
            LegacyReportEditor::OmSupply => ReportType::OmSupply,
            LegacyReportEditor::Others => return Ok(None),
        };
        let context = match data.context {
            LegacyReportContext::CustomerInvoice => ReportContext::OutboundShipment,
            LegacyReportContext::SupplierInvoice => ReportContext::InboundShipment,
            LegacyReportContext::Requisition => ReportContext::Requisition,
            LegacyReportContext::Stocktake => ReportContext::Stocktake,
            LegacyReportContext::Others => return Ok(None),
        };

        let result = ReportRow {
            id: data.id.to_string(),
            name: data.report_name.to_string(),
            r#type,
            template: data.template,
            context,
            comment: data.comment,
        };

        Ok(Some(IntegrationRecords::from_upsert(
            PullUpsertRecord::Report(result),
        )))
    }

    fn try_translate_pull_delete(
        &self,
        _: &StorageConnection,
        sync_record: &SyncBufferRow,
    ) -> Result<Option<IntegrationRecords>, anyhow::Error> {
        let result = match_pull_table(sync_record).then(|| {
            IntegrationRecords::from_delete(&sync_record.record_id, PullDeleteRecordTable::Report)
        });

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use repository::{mock::MockDataInserts, test_db::setup_all};

    #[actix_rt::test]
    async fn test_report_translation() {
        use crate::sync::test::test_data::report as test_data;
        let translator = ReportTranslation {};

        let (_, connection, _, _) =
            setup_all("test_report_translation", MockDataInserts::none()).await;

        for record in test_data::test_pull_upsert_records() {
            let translation_result = translator
                .try_translate_pull_upsert(&connection, &record.sync_buffer_row)
                .unwrap();

            assert_eq!(translation_result, record.translated_record);
        }

        for record in test_data::test_pull_delete_records() {
            let translation_result = translator
                .try_translate_pull_delete(&connection, &record.sync_buffer_row)
                .unwrap();

            assert_eq!(translation_result, record.translated_record);
        }
    }
}
