use repository::{
    requisition_row::RequisitionRow, RepositoryError, RequisitionLine, RequisitionLineFilter,
    RequisitionLineRepository, RequisitionRowRepository, StorageConnection,
};
use repository::{EqualFilter, RequisitionRowApprovalStatus};
use util::inline_edit;

pub fn check_requisition_exists(
    connection: &StorageConnection,
    id: &str,
) -> Result<Option<RequisitionRow>, RepositoryError> {
    RequisitionRowRepository::new(connection).find_one_by_id(id)
}

pub fn get_lines_for_requisition(
    connection: &StorageConnection,
    requisition_id: &str,
) -> Result<Vec<RequisitionLine>, RepositoryError> {
    RequisitionLineRepository::new(connection).query_by_filter(
        RequisitionLineFilter::new().requisition_id(EqualFilter::equal_to(requisition_id)),
    )
}

pub fn generate_requisition_user_id_update(
    user_id: &str,
    existing_requisition_row: RequisitionRow,
) -> Option<RequisitionRow> {
    let user_id_option = Some(user_id.to_string());
    let user_id_has_changed = existing_requisition_row.user_id != user_id_option;
    user_id_has_changed.then(|| {
        inline_edit(&existing_requisition_row, |mut u| {
            u.user_id = user_id_option;
            u
        })
    })
}

pub fn check_approval_status(requisition_row: &RequisitionRow) -> bool {
    // TODO Rework once plugins are implemented
    if let Some(approval_status) = &requisition_row.approval_status {
        if requisition_row.program_id.is_some()
            && (*approval_status == RequisitionRowApprovalStatus::Pending
                || *approval_status == RequisitionRowApprovalStatus::Denied
                || *approval_status == RequisitionRowApprovalStatus::DeniedByAnother)
        {
            return true;
        } else {
            return false;
        }
    }
    false
}
