use repository::{
    EqualFilter, RepositoryError, RequisitionFilter, RequisitionRepository, RequisitionRowStatus,
    RequisitionRowType,
};

use crate::service_provider::ServiceContext;

pub trait RequisitionCountServiceTrait: Send + Sync {
    fn new_response_requisition_count(
        &self,
        ctx: &ServiceContext,
        store_id: &str,
    ) -> Result<i64, RepositoryError> {
        RequisitionCountService {}.new_response_requisition_count(ctx, store_id)
    }

    fn draft_request_requisition_count(
        &self,
        ctx: &ServiceContext,
        store_id: &str,
    ) -> Result<i64, RepositoryError> {
        RequisitionCountService {}.draft_request_requisition_count(ctx, store_id)
    }
}

pub struct RequisitionCountService {}

impl RequisitionCountServiceTrait for RequisitionCountService {
    fn new_response_requisition_count(
        &self,
        ctx: &ServiceContext,
        store_id: &str,
    ) -> Result<i64, RepositoryError> {
        let repo = RequisitionRepository::new(&ctx.connection);
        repo.count(Some(
            RequisitionFilter::new()
                .store_id(EqualFilter::equal_to(store_id))
                .r#type(RequisitionRowType::Response.equal_to())
                .status(RequisitionRowStatus::New.equal_to()),
        ))
    }

    fn draft_request_requisition_count(
        &self,
        ctx: &ServiceContext,
        store_id: &str,
    ) -> Result<i64, RepositoryError> {
        let repo = RequisitionRepository::new(&ctx.connection);
        repo.count(Some(
            RequisitionFilter::new()
                .store_id(EqualFilter::equal_to(store_id))
                .r#type(RequisitionRowType::Request.equal_to())
                .status(RequisitionRowStatus::Draft.equal_to()),
        ))
    }
}
