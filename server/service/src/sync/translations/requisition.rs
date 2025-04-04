use chrono::{NaiveDate, NaiveDateTime};
use repository::{
    requisition_row::{RequisitionRowStatus, RequisitionRowType},
    ChangelogRow, ChangelogTableName, ProgramRowRepository, RequisitionRow,
    RequisitionRowApprovalStatus, RequisitionRowRepository, StorageConnection, SyncBufferRow,
};

use serde::{Deserialize, Serialize};
use util::constants::{MISSING_PROGRAM, NUMBER_OF_DAYS_IN_A_MONTH};

use crate::sync::{
    api::RemoteSyncRecordV5,
    sync_serde::{
        date_and_time_to_datetime, date_from_date_time, date_option_to_isostring,
        date_to_isostring, empty_str_as_option, empty_str_as_option_string, zero_date_as_option,
    },
};

use super::{
    IntegrationRecords, LegacyTableName, PullDeleteRecordTable, PullUpsertRecord, SyncTranslation,
};

const LEGACY_TABLE_NAME: &'static str = LegacyTableName::REQUISITION;

fn match_pull_table(sync_record: &SyncBufferRow) -> bool {
    sync_record.table_name == LEGACY_TABLE_NAME
}
fn match_push_table(changelog: &ChangelogRow) -> bool {
    changelog.table_name == ChangelogTableName::Requisition
}

#[derive(Deserialize, Serialize, Debug)]
pub enum LegacyRequisitionType {
    /// A response to the request created for the suppling store
    #[serde(rename = "response")]
    Response,
    /// A request from a facility where they determine the quantity. If between facilities,
    /// duplicate supply requisition is created on finalisation in the supplying store
    #[serde(rename = "request")]
    Request,
    /// for stock history, where the facility submits stock on hand, and their history is used to
    /// determine a supply quantity
    #[serde(rename = "sh")]
    Sh,
    /// for imprest (where each item has a pre-determined max quantity and the facility submits
    /// their current stock on hand)
    #[serde(rename = "im")]
    Im,
    /// the supplying store's copy of a request requisition
    #[serde(rename = "supply")]
    Supply,
    /// A requisition that is for reporting purposes only.
    #[serde(rename = "report")]
    Report,
    /// Bucket to catch all other variants
    #[serde(other)]
    Others,
}

#[derive(Deserialize, Serialize, Debug)]
pub enum LegacyRequisitionStatus {
    /// suggested
    #[serde(rename = "sg")]
    Sg,
    /// confirmed
    #[serde(rename = "cn")]
    Cn,
    /// finalised
    #[serde(rename = "fn")]
    Fn,
    /// Bucket to catch all other variants
    /// E.g. "wp" (web progress), "wf" (web finalised)
    #[serde(other)]
    Others,
}

// https://github.com/sussol/msupply/blob/master/Project/Sources/Methods/AUTHORISATION_STATUSES.4dm
#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
pub enum LegacyAuthorisationStatus {
    None,
    Pending,
    Authorised,
    Denied,
    #[serde(rename = "auto-authorised")]
    AutoAuthorised,
    #[serde(rename = "authorised by another authoriser")]
    AuthorisedByAnother,
    #[serde(rename = "denied by another authoriser")]
    DeniedByAnother,
}

#[allow(non_snake_case)]
#[derive(Deserialize, Serialize)]
pub struct LegacyRequisitionRow {
    pub ID: String,
    pub serial_number: i64,
    pub name_ID: String,
    pub store_ID: String,
    pub r#type: LegacyRequisitionType,
    pub status: LegacyRequisitionStatus,
    #[serde(deserialize_with = "empty_str_as_option_string")]
    #[serde(rename = "user_ID")]
    pub user_id: Option<String>,
    // created_datetime
    #[serde(serialize_with = "date_to_isostring")]
    pub date_entered: NaiveDate,

    #[serde(rename = "lastModifiedAt")]
    pub last_modified_at: i64,
    #[serde(deserialize_with = "empty_str_as_option_string")]
    pub requester_reference: Option<String>,
    #[serde(deserialize_with = "empty_str_as_option_string")]
    pub linked_requisition_id: Option<String>,
    /// min_months_of_stock
    pub thresholdMOS: f64,
    /// relates to max_months_of_stock
    pub daysToSupply: i64,

    #[serde(deserialize_with = "empty_str_as_option_string")]
    pub comment: Option<String>,

    #[serde(default)]
    #[serde(rename = "om_created_datetime")]
    #[serde(deserialize_with = "empty_str_as_option")]
    pub created_datetime: Option<NaiveDateTime>,

    #[serde(default)]
    #[serde(rename = "om_sent_datetime")]
    #[serde(deserialize_with = "empty_str_as_option")]
    pub sent_datetime: Option<NaiveDateTime>,

    #[serde(default)]
    #[serde(rename = "om_finalised_datetime")]
    #[serde(deserialize_with = "empty_str_as_option")]
    pub finalised_datetime: Option<NaiveDateTime>,

    #[serde(default)]
    #[serde(rename = "om_expected_delivery_date")]
    #[serde(deserialize_with = "zero_date_as_option")]
    #[serde(serialize_with = "date_option_to_isostring")]
    pub expected_delivery_date: Option<NaiveDate>,

    #[serde(rename = "om_max_months_of_stock")]
    pub max_months_of_stock: Option<f64>,

    #[serde(deserialize_with = "empty_str_as_option")]
    #[serde(default)]
    pub om_status: Option<RequisitionRowStatus>,
    /// We ignore the legacy colour field
    #[serde(deserialize_with = "empty_str_as_option_string")]
    #[serde(default)]
    pub om_colour: Option<String>,

    #[serde(deserialize_with = "empty_str_as_option")]
    #[serde(rename = "authorisationStatus")]
    pub approval_status: Option<LegacyAuthorisationStatus>,

    #[serde(deserialize_with = "empty_str_as_option_string")]
    pub orderType: Option<String>,
    #[serde(deserialize_with = "empty_str_as_option_string")]
    pub periodID: Option<String>,
    #[serde(deserialize_with = "empty_str_as_option_string")]
    pub programID: Option<String>,
}

pub(crate) struct RequisitionTranslation {}
impl SyncTranslation for RequisitionTranslation {
    fn try_translate_pull_upsert(
        &self,
        conn: &StorageConnection,
        sync_record: &SyncBufferRow,
    ) -> Result<Option<IntegrationRecords>, anyhow::Error> {
        if !match_pull_table(sync_record) {
            return Ok(None);
        }
        let data = serde_json::from_str::<LegacyRequisitionRow>(&sync_record.data)?;
        let r#type = from_legacy_type(&data.r#type).ok_or(anyhow::Error::msg(format!(
            "Unsupported requisition type: {:?}",
            data.r#type
        )))?;

        let (
            created_datetime,
            sent_datetime,
            finalised_datetime,
            max_months_of_stock,
            status,
            colour,
        ) = match data.created_datetime {
            // use new om_* fields
            Some(created_datetime) => (
                created_datetime,
                data.sent_datetime,
                data.finalised_datetime,
                data.max_months_of_stock.unwrap_or(0.0),
                data.om_status.ok_or(anyhow::Error::msg(
                    "Invalid data: om_created_datetime set but om_status missing",
                ))?,
                data.om_colour,
            ),
            None => (
                date_and_time_to_datetime(data.date_entered, 0),
                from_legacy_sent_datetime(data.last_modified_at, &r#type),
                from_legacy_finalised_datetime(data.last_modified_at, &r#type),
                data.daysToSupply as f64 / NUMBER_OF_DAYS_IN_A_MONTH,
                from_legacy_status(&data.r#type, &data.status).ok_or(anyhow::Error::msg(
                    format!("Unsupported requisition status: {:?}", data.status),
                ))?,
                None,
            ),
        };

        // TODO: Delete when soft delete for master list is implemented
        let program_id = if let Some(program_id) = data.programID {
            let program = ProgramRowRepository::new(conn).find_one_by_id(&program_id)?;

            match program {
                Some(program) => Some(program.id),
                None => Some(MISSING_PROGRAM.to_string()),
            }
        } else {
            None
        };

        let result = RequisitionRow {
            id: data.ID.to_string(),
            user_id: data.user_id,
            requisition_number: data.serial_number,
            name_id: data.name_ID,
            store_id: data.store_ID,
            r#type,
            status,
            created_datetime,
            sent_datetime,
            finalised_datetime,
            colour,
            comment: data.comment,
            their_reference: data.requester_reference,
            max_months_of_stock,
            min_months_of_stock: data.thresholdMOS,
            linked_requisition_id: data.linked_requisition_id,
            expected_delivery_date: data.expected_delivery_date,
            approval_status: data.approval_status.map(|s| s.to()),
            program_id,
            period_id: data.periodID,
            order_type: data.orderType,
        };

        Ok(Some(IntegrationRecords::from_upsert(
            PullUpsertRecord::Requisition(result),
        )))
    }

    fn try_translate_pull_delete(
        &self,
        _: &StorageConnection,
        sync_record: &SyncBufferRow,
    ) -> Result<Option<IntegrationRecords>, anyhow::Error> {
        // TODO, check site ? (should never get delete records for this site, only transfer other half)
        let result = match_pull_table(sync_record).then(|| {
            IntegrationRecords::from_delete(
                &sync_record.record_id,
                PullDeleteRecordTable::Requisition,
            )
        });

        Ok(result)
    }

    fn try_translate_push_upsert(
        &self,
        connection: &StorageConnection,
        changelog: &ChangelogRow,
    ) -> Result<Option<Vec<RemoteSyncRecordV5>>, anyhow::Error> {
        if !match_push_table(changelog) {
            return Ok(None);
        }

        let RequisitionRow {
            id,
            user_id,
            requisition_number,
            name_id,
            store_id,
            r#type,
            status,
            created_datetime,
            sent_datetime,
            finalised_datetime,
            colour,
            comment,
            their_reference,
            max_months_of_stock,
            min_months_of_stock,
            linked_requisition_id,
            expected_delivery_date,
            approval_status,
            program_id,
            period_id,
            order_type,
        } = RequisitionRowRepository::new(connection)
            .find_one_by_id(&changelog.record_id)?
            .ok_or(anyhow::Error::msg(format!(
                "Requisition row not found: {}",
                changelog.record_id
            )))?;

        let legacy_row = LegacyRequisitionRow {
            ID: id.clone(),
            user_id,
            serial_number: requisition_number,
            name_ID: name_id,
            store_ID: store_id.clone(),
            r#type: to_legacy_type(&r#type),
            status: to_legacy_status(&r#type, &status).ok_or(anyhow::Error::msg(format!(
                "Unexpected row requisition status {:?} (type: {:?}), row id:{}",
                status, r#type, changelog.record_id
            )))?,
            om_status: Some(status),
            date_entered: date_from_date_time(&created_datetime),
            created_datetime: Some(created_datetime),
            last_modified_at: to_legacy_last_modified_at(
                &r#type,
                sent_datetime,
                finalised_datetime,
            ),
            sent_datetime,
            finalised_datetime,
            expected_delivery_date,
            requester_reference: their_reference,
            linked_requisition_id,
            thresholdMOS: min_months_of_stock,
            daysToSupply: (NUMBER_OF_DAYS_IN_A_MONTH * max_months_of_stock) as i64,
            max_months_of_stock: Some(max_months_of_stock),
            om_colour: colour.clone(),
            comment,
            approval_status: approval_status.map(LegacyAuthorisationStatus::from),
            programID: program_id,
            periodID: period_id,
            orderType: order_type,
        };

        Ok(Some(vec![RemoteSyncRecordV5::new_upsert(
            changelog,
            LEGACY_TABLE_NAME,
            serde_json::to_value(&legacy_row)?,
        )]))
    }

    fn try_translate_push_delete(
        &self,
        _: &StorageConnection,
        changelog: &ChangelogRow,
    ) -> Result<Option<Vec<RemoteSyncRecordV5>>, anyhow::Error> {
        let result = match_push_table(changelog)
            .then(|| vec![RemoteSyncRecordV5::new_delete(changelog, LEGACY_TABLE_NAME)]);

        Ok(result)
    }
}

fn from_legacy_sent_datetime(
    last_modified_at: i64,
    r#type: &RequisitionRowType,
) -> Option<NaiveDateTime> {
    match r#type {
        RequisitionRowType::Request => {
            if last_modified_at > 0 {
                Some(NaiveDateTime::from_timestamp_opt(last_modified_at, 0).unwrap())
            } else {
                None
            }
        }
        RequisitionRowType::Response => None,
    }
}

fn from_legacy_finalised_datetime(
    last_modified_at: i64,
    r#type: &RequisitionRowType,
) -> Option<NaiveDateTime> {
    match r#type {
        RequisitionRowType::Request => None,
        RequisitionRowType::Response => {
            if last_modified_at > 0 {
                Some(NaiveDateTime::from_timestamp_opt(last_modified_at, 0).unwrap())
            } else {
                None
            }
        }
    }
}

fn to_legacy_last_modified_at(
    r#type: &RequisitionRowType,
    sent_datetime: Option<NaiveDateTime>,
    finalised_datetime: Option<NaiveDateTime>,
) -> i64 {
    match r#type {
        RequisitionRowType::Request => sent_datetime.map(|time| time.timestamp()).unwrap_or(0),
        RequisitionRowType::Response => {
            finalised_datetime.map(|time| time.timestamp()).unwrap_or(0)
        }
    }
}

fn from_legacy_type(t: &LegacyRequisitionType) -> Option<RequisitionRowType> {
    let t = match t {
        LegacyRequisitionType::Response => RequisitionRowType::Response,
        LegacyRequisitionType::Request => RequisitionRowType::Request,
        _ => return None,
    };
    Some(t)
}

fn to_legacy_type(t: &RequisitionRowType) -> LegacyRequisitionType {
    match t {
        RequisitionRowType::Request => LegacyRequisitionType::Request,
        RequisitionRowType::Response => LegacyRequisitionType::Response,
    }
}

fn from_legacy_status(
    r#type: &LegacyRequisitionType,
    status: &LegacyRequisitionStatus,
) -> Option<RequisitionRowStatus> {
    let status = match r#type {
        LegacyRequisitionType::Request => match status {
            LegacyRequisitionStatus::Sg => RequisitionRowStatus::Draft,
            &LegacyRequisitionStatus::Cn => RequisitionRowStatus::Sent,
            LegacyRequisitionStatus::Fn => RequisitionRowStatus::Sent,
            _ => return None,
        },
        LegacyRequisitionType::Response => match status {
            LegacyRequisitionStatus::Sg => RequisitionRowStatus::New,
            &LegacyRequisitionStatus::Cn => RequisitionRowStatus::New,
            LegacyRequisitionStatus::Fn => RequisitionRowStatus::Finalised,
            _ => return None,
        },
        _ => return None,
    };
    Some(status)
}

fn to_legacy_status(
    r#type: &RequisitionRowType,
    status: &RequisitionRowStatus,
) -> Option<LegacyRequisitionStatus> {
    let status = match r#type {
        RequisitionRowType::Request => match status {
            RequisitionRowStatus::Draft => LegacyRequisitionStatus::Sg,
            RequisitionRowStatus::Sent => LegacyRequisitionStatus::Fn,
            RequisitionRowStatus::Finalised => LegacyRequisitionStatus::Fn,
            _ => return None,
        },
        RequisitionRowType::Response => match status {
            RequisitionRowStatus::New => LegacyRequisitionStatus::Cn,
            RequisitionRowStatus::Finalised => LegacyRequisitionStatus::Fn,
            _ => return None,
        },
    };
    Some(status)
}

impl LegacyAuthorisationStatus {
    fn to(self) -> RequisitionRowApprovalStatus {
        use LegacyAuthorisationStatus as from;
        use RequisitionRowApprovalStatus as to;
        match self {
            from::None => to::None,
            from::Pending => to::Pending,
            from::Authorised => to::Approved,
            from::Denied => to::Denied,
            from::AutoAuthorised => to::AutoApproved,
            from::AuthorisedByAnother => to::ApprovedByAnother,
            from::DeniedByAnother => to::DeniedByAnother,
        }
    }

    fn from(status: RequisitionRowApprovalStatus) -> LegacyAuthorisationStatus {
        use LegacyAuthorisationStatus as to;
        use RequisitionRowApprovalStatus as from;
        match status {
            from::None => to::None,
            from::Pending => to::Pending,
            from::Approved => to::Authorised,
            from::Denied => to::Denied,
            from::AutoApproved => to::AutoAuthorised,
            from::ApprovedByAnother => to::AuthorisedByAnother,
            from::DeniedByAnother => to::DeniedByAnother,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use repository::{mock::MockDataInserts, test_db::setup_all};

    #[actix_rt::test]
    async fn test_requisition_translation() {
        use crate::sync::test::test_data::requisition as test_data;
        let translator = RequisitionTranslation {};

        let (_, connection, _, _) =
            setup_all("test_requisition_translation", MockDataInserts::none()).await;

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
