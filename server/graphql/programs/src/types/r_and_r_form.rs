use async_graphql::*;

use graphql_core::generic_filters::{DatetimeFilterInput, EqualFilterStringInput};
use graphql_types::types::{rnr_form::RnRFormNode, PeriodNode};
use repository::{
    DatetimeFilter, EqualFilter, Period, PeriodScheduleRow, RnRForm, RnRFormFilter, RnRFormSort,
    RnRFormSortField,
};
use service::{rnr_form::X, ListResult};

#[derive(SimpleObject)]
pub struct RnRFormConnector {
    pub total_count: u32,
    pub nodes: Vec<RnRFormNode>,
}

#[derive(Union)]
pub enum RnRFormsResponse {
    Response(RnRFormConnector),
}

#[derive(Enum, Copy, Clone, PartialEq, Eq)]
#[graphql(rename_items = "camelCase")]
pub enum RnRFormSortFieldInput {
    Period,
    Program,
    CreatedDatetime,
    Status,
    SupplierName,
}

#[derive(InputObject)]
pub struct RnRFormSortInput {
    /// Sort query result by `key`
    key: RnRFormSortFieldInput,
    /// Sort query result is sorted descending or ascending (if not provided the default is
    /// ascending)
    desc: Option<bool>,
}

impl RnRFormSortInput {
    pub fn to_domain(self) -> RnRFormSort {
        let key = match self.key {
            RnRFormSortFieldInput::Period => RnRFormSortField::Period,
            RnRFormSortFieldInput::Program => RnRFormSortField::Program,
            RnRFormSortFieldInput::CreatedDatetime => RnRFormSortField::CreatedDatetime,
            RnRFormSortFieldInput::Status => RnRFormSortField::Status,
            RnRFormSortFieldInput::SupplierName => RnRFormSortField::SupplierName,
        };

        RnRFormSort {
            key,
            desc: self.desc,
        }
    }
}

#[derive(InputObject, Clone)]
pub struct RnRFormFilterInput {
    pub id: Option<EqualFilterStringInput>,
    pub created_datetime: Option<DatetimeFilterInput>,
    pub store_id: Option<EqualFilterStringInput>,
}
impl From<RnRFormFilterInput> for RnRFormFilter {
    fn from(f: RnRFormFilterInput) -> Self {
        RnRFormFilter {
            id: f.id.map(EqualFilter::from),
            created_datetime: f.created_datetime.map(DatetimeFilter::from),
            store_id: f.store_id.map(EqualFilter::from),
            // TODO
            ..Default::default()
        }
    }
}

impl RnRFormConnector {
    pub fn from_domain(forms: ListResult<RnRForm>) -> RnRFormConnector {
        RnRFormConnector {
            total_count: forms.count,
            nodes: forms
                .rows
                .into_iter()
                .map(
                    |RnRForm {
                         rnr_form_row,
                         name_row,
                         period_row,
                         program_row,
                         store_row: _,
                     }| RnRFormNode {
                        rnr_form_row,
                        program_row,
                        period_row,
                        supplier_row: name_row,
                    },
                )
                .collect(),
        }
    }
}

#[derive(SimpleObject)]
pub struct PeriodSchedulesConnector {
    pub total_count: u32,
    pub nodes: Vec<PeriodScheduleNode>,
}

impl PeriodSchedulesConnector {
    pub fn from_domain(schedules: Vec<X>) -> PeriodSchedulesConnector {
        PeriodSchedulesConnector {
            total_count: 0, // TODO
            nodes: schedules
                .into_iter()
                .map(
                    |X {
                         period_schedule,
                         periods,
                     }| PeriodScheduleNode {
                        schedule_row: period_schedule,
                        periods,
                    },
                )
                .collect(),
        }
    }
}

#[derive(Union)]
pub enum PeriodSchedulesResponse {
    Response(PeriodSchedulesConnector),
}

pub struct PeriodScheduleNode {
    pub schedule_row: PeriodScheduleRow,
    pub periods: Vec<Period>,
}

#[Object]
impl PeriodScheduleNode {
    pub async fn id(&self) -> &str {
        &self.schedule_row.id
    }

    pub async fn name(&self) -> &str {
        &self.schedule_row.name
    }

    pub async fn periods_in_use(&self) -> Vec<PeriodInUseNode> {
        self.periods
            .clone()
            .into_iter()
            .map(PeriodInUseNode::from_domain)
            .collect()
    }
}

pub struct PeriodInUseNode {
    period: Period,
}

#[Object]
impl PeriodInUseNode {
    pub async fn id(&self) -> &str {
        &self.period.period_row.id
    }

    pub async fn period(&self) -> PeriodNode {
        PeriodNode::from_domain(self.period.period_row.clone())
    }

    pub async fn in_use(&self) -> bool {
        self.period.rnr_form_row.is_some()
    }
}

impl PeriodInUseNode {
    pub fn from_domain(period: Period) -> PeriodInUseNode {
        PeriodInUseNode { period }
    }
}
