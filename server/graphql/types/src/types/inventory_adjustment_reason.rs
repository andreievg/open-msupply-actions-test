use async_graphql::*;
use repository::{
    InventoryAdjustmentReason, InventoryAdjustmentReasonRow, InventoryAdjustmentReasonType,
};
use service::ListResult;

#[derive(PartialEq, Debug)]
pub struct InventoryAdjustmentReasonNode {
    inventory_adjustment_reason: InventoryAdjustmentReason,
}

#[derive(SimpleObject)]
pub struct InventoryAdjustmentReasonConnector {
    total_count: u32,
    nodes: Vec<InventoryAdjustmentReasonNode>,
}

#[derive(Enum, Copy, Clone, PartialEq, Eq)]
pub enum InventoryAdjustmentReasonNodeType {
    Positive,
    Negative,
}

#[Object]
impl InventoryAdjustmentReasonNode {
    pub async fn id(&self) -> &str {
        &self.row().id
    }

    pub async fn r#type(&self) -> InventoryAdjustmentReasonNodeType {
        InventoryAdjustmentReasonNodeType::from_domain(&self.row().r#type)
    }

    pub async fn is_active(&self) -> &bool {
        &self.row().is_active
    }

    pub async fn reason(&self) -> &str {
        &self.row().reason
    }
}

impl InventoryAdjustmentReasonNode {
    pub fn from_domain(inventory_adjustment_reason: InventoryAdjustmentReason) -> Self {
        InventoryAdjustmentReasonNode {
            inventory_adjustment_reason,
        }
    }

    pub fn row(&self) -> &InventoryAdjustmentReasonRow {
        &self
            .inventory_adjustment_reason
            .inventory_adjustment_reason_row
    }
}

impl InventoryAdjustmentReasonNodeType {
    pub fn from_domain(from: &InventoryAdjustmentReasonType) -> InventoryAdjustmentReasonNodeType {
        use InventoryAdjustmentReasonNodeType as to;
        use InventoryAdjustmentReasonType as from;

        match from {
            from::Positive => to::Positive,
            from::Negative => to::Negative,
        }
    }

    pub fn to_domain(self) -> InventoryAdjustmentReasonType {
        use InventoryAdjustmentReasonNodeType as from;
        use InventoryAdjustmentReasonType as to;

        match self {
            from::Positive => to::Positive,
            from::Negative => to::Negative,
        }
    }
}

impl InventoryAdjustmentReasonConnector {
    pub fn from_domain(
        inventory_adjustment_reasons: ListResult<InventoryAdjustmentReason>,
    ) -> InventoryAdjustmentReasonConnector {
        InventoryAdjustmentReasonConnector {
            total_count: inventory_adjustment_reasons.count,
            nodes: inventory_adjustment_reasons
                .rows
                .into_iter()
                .map(|inventory_adjustment_reason| {
                    InventoryAdjustmentReasonNode::from_domain(inventory_adjustment_reason)
                })
                .collect(),
        }
    }
}
