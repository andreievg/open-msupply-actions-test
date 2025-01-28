use super::{
    inventory_adjustment_reason_row::inventory_adjustment_reason, DBType, StorageConnection,
};
use diesel::prelude::*;
use util::inline_init;

use crate::{
    diesel_macros::{apply_equal_filter, apply_sort_no_case},
    repository_error::RepositoryError,
    InventoryAdjustmentReasonRow, InventoryAdjustmentType,
};

use crate::{EqualFilter, Pagination, Sort};

#[derive(PartialEq, Debug, Clone)]
pub struct InventoryAdjustmentReason {
    pub inventory_adjustment_reason_row: InventoryAdjustmentReasonRow,
}

#[derive(Clone, PartialEq, Debug, Default)]
pub struct InventoryAdjustmentReasonFilter {
    pub id: Option<EqualFilter<String>>,
    pub r#type: Option<EqualFilter<InventoryAdjustmentType>>,
    pub is_active: Option<bool>,
}

#[derive(PartialEq, Debug)]
pub enum InventoryAdjustmentReasonSortField {
    Id,
    InventoryAdjustmentReasonType,
    Reason,
}

pub type InventoryAdjustmentReasonSort = Sort<InventoryAdjustmentReasonSortField>;

pub struct InventoryAdjustmentReasonRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> InventoryAdjustmentReasonRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        InventoryAdjustmentReasonRepository { connection }
    }

    pub fn count(
        &self,
        filter: Option<InventoryAdjustmentReasonFilter>,
    ) -> Result<i64, RepositoryError> {
        let query = create_filtered_query(filter);
        Ok(query
            .count()
            .get_result(self.connection.lock().connection())?)
    }

    pub fn query_by_filter(
        &self,
        filter: InventoryAdjustmentReasonFilter,
    ) -> Result<Vec<InventoryAdjustmentReason>, RepositoryError> {
        self.query(Pagination::new(), Some(filter), None)
    }

    pub fn query(
        &self,
        pagination: Pagination,
        filter: Option<InventoryAdjustmentReasonFilter>,
        sort: Option<InventoryAdjustmentReasonSort>,
    ) -> Result<Vec<InventoryAdjustmentReason>, RepositoryError> {
        let mut query = create_filtered_query(filter);
        if let Some(sort) = sort {
            match sort.key {
                InventoryAdjustmentReasonSortField::Id => {
                    apply_sort_no_case!(query, sort, inventory_adjustment_reason::id)
                }
                InventoryAdjustmentReasonSortField::InventoryAdjustmentReasonType => {
                    apply_sort_no_case!(query, sort, inventory_adjustment_reason::type_)
                }
                InventoryAdjustmentReasonSortField::Reason => {
                    apply_sort_no_case!(query, sort, inventory_adjustment_reason::reason)
                }
            }
        }

        let result = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64)
            .load::<InventoryAdjustmentReasonRow>(self.connection.lock().connection())?;

        Ok(result.into_iter().map(to_domain).collect())
    }
}

type BoxedInventoryAdjustmentQuery = inventory_adjustment_reason::BoxedQuery<'static, DBType>;

fn create_filtered_query(
    filter: Option<InventoryAdjustmentReasonFilter>,
) -> BoxedInventoryAdjustmentQuery {
    let mut query = inventory_adjustment_reason::table.into_boxed();

    if let Some(filter) = filter {
        apply_equal_filter!(query, filter.id, inventory_adjustment_reason::id);
        apply_equal_filter!(query, filter.r#type, inventory_adjustment_reason::type_);
        if let Some(value) = filter.is_active {
            query = query.filter(inventory_adjustment_reason::is_active.eq(value));
        }
    }

    query
}

fn to_domain(
    inventory_adjustment_reason_row: InventoryAdjustmentReasonRow,
) -> InventoryAdjustmentReason {
    InventoryAdjustmentReason {
        inventory_adjustment_reason_row,
    }
}

impl InventoryAdjustmentReasonFilter {
    pub fn new() -> InventoryAdjustmentReasonFilter {
        Self::default()
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn r#type(mut self, filter: EqualFilter<InventoryAdjustmentType>) -> Self {
        self.r#type = Some(filter);
        self
    }

    pub fn is_active(mut self, filter: bool) -> Self {
        self.is_active = Some(filter);
        self
    }
}

impl InventoryAdjustmentType {
    pub fn equal_to(&self) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.equal_to = Some(self.clone()))
    }
}
