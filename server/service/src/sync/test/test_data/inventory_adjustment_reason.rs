use crate::sync::{
    test::TestSyncPullRecord,
    translations::{LegacyTableName, PullUpsertRecord},
};
use repository::{InventoryAdjustmentReasonRow, InventoryAdjustmentReasonType};

const INVENTORY_ADJUSTMENT_REASON_1: (&'static str, &'static str) = (
    "positive_adjustment",
    r#"{
    "ID": "positive_adjustment",
    "type": "positiveInventoryAdjustment",
    "isActive": true,
    "title": "Found"
    }"#,
);

pub(crate) fn test_pull_upsert_records() -> Vec<TestSyncPullRecord> {
    vec![TestSyncPullRecord::new_pull_upsert(
        LegacyTableName::INVENTORY_ADJUSTMENT_REASON,
        INVENTORY_ADJUSTMENT_REASON_1,
        PullUpsertRecord::InventoryAdjustmentReason(InventoryAdjustmentReasonRow {
            id: INVENTORY_ADJUSTMENT_REASON_1.0.to_string(),
            r#type: InventoryAdjustmentReasonType::Positive,
            is_active: true,
            reason: "Found".to_string(),
        }),
    )]
}
