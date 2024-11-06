use async_graphql::*;
use graphql_core::{
    simple_generic_errors::{CannotEditRequisition, ForeignKey, ForeignKeyError},
    standard_graphql_error::{validate_auth, StandardGraphqlError},
    ContextExt,
};
use graphql_types::types::RequisitionLineNode;
use repository::RequisitionLine;
use service::{
    auth::{Resource, ResourceAccessRequest},
    requisition_line::response_requisition_line::{
        InsertResponseRequisitionLine as ServiceInput,
        InsertResponseRequisitionLineError as ServiceError,
    },
};

use crate::mutations::errors::RequisitionLineWithItemIdExists;

#[derive(InputObject)]
#[graphql(name = "InsertResponseRequisitionLineInput")]
pub struct InsertInput {
    pub id: String,
    pub item_id: String,
    pub requisition_id: String,
    pub supply_quantity: Option<f64>,
    pub comment: Option<String>,
    // Manual Requisition fields
    pub requested_quantity: Option<f64>,
    pub stock_on_hand: Option<f64>,
    pub average_monthly_consumption: Option<f64>,
    pub incoming_units: Option<f64>,
    pub outgoing_units: Option<f64>,
    pub loss_in_units: Option<f64>,
    pub addition_in_units: Option<f64>,
    pub expiring_units: Option<f64>,
    pub days_out_of_stock: Option<f64>,
    pub option_id: Option<String>,
}

#[derive(Interface)]
#[graphql(name = "InsertResponseRequisitionLineErrorInterface")]
#[graphql(field(name = "description", ty = "String"))]
pub enum InsertErrorInterface {
    RequisitionDoesNotExist(ForeignKeyError),
    CannotEditRequisition(CannotEditRequisition),
    RequisitionLineWithItemIdExists(RequisitionLineWithItemIdExists),
}

#[derive(SimpleObject)]
#[graphql(name = "InsertResponseRequisitionLineError")]
pub struct InsertError {
    pub error: InsertErrorInterface,
}

#[derive(Union)]
#[graphql(name = "InsertResponseRequisitionLineResponse")]
pub enum InsertResponse {
    Error(InsertError),
    Response(RequisitionLineNode),
}
pub fn insert(ctx: &Context<'_>, store_id: &str, input: InsertInput) -> Result<InsertResponse> {
    let user = validate_auth(
        ctx,
        &ResourceAccessRequest {
            resource: Resource::MutateRequisition,
            store_id: Some(store_id.to_string()),
        },
    )?;

    let service_provider = ctx.service_provider();
    let service_context = service_provider.context(store_id.to_string(), user.user_id)?;

    map_response(
        service_provider
            .requisition_line_service
            .insert_response_requisition_line(&service_context, input.to_domain()),
    )
}

fn map_response(from: Result<RequisitionLine, ServiceError>) -> Result<InsertResponse> {
    let result = match from {
        Ok(requisition_line) => {
            InsertResponse::Response(RequisitionLineNode::from_domain(requisition_line))
        }
        Err(error) => InsertResponse::Error(InsertError {
            error: map_error(error)?,
        }),
    };

    Ok(result)
}

impl InsertInput {
    pub fn to_domain(self) -> ServiceInput {
        let InsertInput {
            id,
            item_id,
            requisition_id,
            supply_quantity,
            comment,
            stock_on_hand,
            requested_quantity,
            average_monthly_consumption,
            incoming_units,
            outgoing_units,
            loss_in_units,
            addition_in_units,
            expiring_units,
            days_out_of_stock,
            option_id,
        } = self;

        ServiceInput {
            id,
            item_id,
            requisition_id,
            supply_quantity,
            comment,
            stock_on_hand,
            requested_quantity,
            average_monthly_consumption,
            incoming_units,
            outgoing_units,
            loss_in_units,
            addition_in_units,
            expiring_units,
            days_out_of_stock,
            option_id,
        }
    }
}

fn map_error(error: ServiceError) -> Result<InsertErrorInterface> {
    use StandardGraphqlError::*;
    let formatted_error = format!("{:#?}", error);

    let graphql_error = match error {
        // Structured Errors
        ServiceError::ItemAlreadyExistInRequisition => {
            return Ok(InsertErrorInterface::RequisitionLineWithItemIdExists(
                RequisitionLineWithItemIdExists {},
            ))
        }
        ServiceError::RequisitionDoesNotExist => {
            return Ok(InsertErrorInterface::RequisitionDoesNotExist(
                ForeignKeyError(ForeignKey::RequisitionId),
            ))
        }
        ServiceError::CannotEditRequisition => {
            return Ok(InsertErrorInterface::CannotEditRequisition(
                CannotEditRequisition {},
            ))
        }
        // Standard Graphql Errors
        ServiceError::RequisitionLineAlreadyExists => BadUserInput(formatted_error),
        ServiceError::NotThisStoreRequisition => BadUserInput(formatted_error),
        ServiceError::NotAResponseRequisition => BadUserInput(formatted_error),
        ServiceError::ItemDoesNotExist => BadUserInput(formatted_error),
        ServiceError::CannotAddItemToProgramRequisition => BadUserInput(formatted_error),
        ServiceError::CannotFindItemStatusForRequisitionLine => InternalError(formatted_error),
        ServiceError::NewlyCreatedRequisitionLineDoesNotExist => InternalError(formatted_error),
        ServiceError::DatabaseError(_) => InternalError(formatted_error),
    };

    Err(graphql_error.extend())
}
