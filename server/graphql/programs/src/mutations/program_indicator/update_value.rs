use async_graphql::*;
use graphql_core::{
    simple_generic_errors::RecordNotFound, standard_graphql_error::validate_auth, ContextExt,
};
use graphql_types::types::program_indicator::IndicatorValueNode;
use repository::indicator_line;
use service::auth::{Resource, ResourceAccessRequest};

#[derive(InputObject)]
pub struct UpdateIndicatorValueInput {
    pub id: String,
    pub value: String,
}

#[derive(Interface)]
#[graphql(name = "UpdateIndicatorValueErrorInterface")]
#[graphql(field(name = "description", ty = "String"))]
pub enum UpdateErrorInterface {
    RecordNotFound(RecordNotFound),
}

#[derive(SimpleObject)]
#[graphql(name = "UpdateIndicatorValueError")]
pub struct UpdateError {
    pub error: UpdateErrorInterface,
}

#[derive(Union)]
pub enum UpdateIndicatorValueResponse {
    Response(IndicatorValueNode),
    Error(UpdateError),
}

pub fn update_indicator_value(
    ctx: &Context<'_>,
    store_id: String,
    input: UpdateIndicatorValueInput,
) -> Result<UpdateIndicatorValueResponse> {
    let user = validate_auth(
        ctx,
        &ResourceAccessRequest {
            resource: Resource::MutateRequisition,
            store_id: Some(store_id.clone()),
        },
    )?;

    let service_provider = ctx.service_provider();
    let service_context = service_provider.context(store_id.to_string(), user.user_id)?;

    let response = match service_provider
        .indicator_value_service
        .update_indicator_value(ctx, input)
    {
        Ok(incator_value) => {
            UpdateIndicatorValueResponse::Response(IndicatorValueNode::from_domain(indicator_value))
        }
        Err(error) => UpdateResponse::Error(UpdateError {
            error: map_error(error)?,
        }),
    };

    Ok(response)
}
