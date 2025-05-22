use async_graphql::*;
use graphql_core::pagination::PaginationInput;
use graphql_core::standard_graphql_error::{validate_auth, StandardGraphqlError};
use graphql_core::ContextExt;
use graphql_types::types::*;
use mutations::AddToShipmentFromMasterListInput;
use repository::PaginationOption;
use service::auth::{Resource, ResourceAccessRequest};

pub mod invoice_queries;
use self::invoice_queries::*;

pub mod mutations;
use self::mutations::{
    customer_return, inbound_shipment, outbound_shipment, prescription, supplier_return,
};

#[cfg(test)]
mod query_tests;

#[derive(Default, Clone)]
pub struct InvoiceQueries;

#[Object]
impl InvoiceQueries {
    pub async fn invoice(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        #[graphql(desc = "id of the invoice")] id: String,
    ) -> Result<InvoiceResponse> {
        get_invoice(ctx, Some(store_id), &id)
    }

    pub async fn invoice_by_number(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        invoice_number: u32,
        r#type: InvoiceNodeType,
    ) -> Result<InvoiceResponse> {
        get_invoice_by_number(ctx, store_id, invoice_number, r#type)
    }

    pub async fn invoices(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        #[graphql(desc = "Pagination option (first and offset)")] page: Option<PaginationInput>,
        #[graphql(desc = "Filter option")] filter: Option<InvoiceFilterInput>,
        #[graphql(desc = "Sort options (only first sort input is evaluated for this endpoint)")]
        sort: Option<Vec<InvoiceSortInput>>,
    ) -> Result<InvoicesResponse> {
        let user = validate_auth(
            ctx,
            &ResourceAccessRequest {
                resource: Resource::QueryInvoice,
                store_id: Some(store_id.clone()),
            },
        )?;

        let service_provider = ctx.service_provider_owned();
        let service_context = service_provider.context(store_id.clone(), user.user_id)?;

        let invoices = actix_web::rt::task::spawn_blocking(move || {
            service_provider
                .invoice_service
                .get_invoices(
                    &service_context,
                    Some(&store_id),
                    page.map(PaginationOption::from),
                    filter.map(|filter| filter.to_domain()),
                    // Currently only one sort option is supported, use the first from the list.
                    sort.and_then(|mut sort_list| sort_list.pop())
                        .map(|sort| sort.to_domain()),
                )
                .map_err(StandardGraphqlError::from_list_error)
        })
        .await
        .unwrap()?;

        Ok(InvoicesResponse::Response(InvoiceConnector::from_domain(
            invoices,
        )))
    }

    async fn insert_prescription(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: prescription::insert::InsertInput,
    ) -> Result<prescription::insert::InsertResponse> {
        prescription::insert::insert(ctx, &store_id, input)
    }
}

#[derive(Default, Clone)]
pub struct InvoiceMutations;

#[Object]
impl InvoiceMutations {
    async fn insert_outbound_shipment(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: outbound_shipment::insert::InsertInput,
    ) -> Result<outbound_shipment::insert::InsertResponse> {
        outbound_shipment::insert::insert(ctx, &store_id, input)
    }

    async fn update_outbound_shipment(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: outbound_shipment::update::UpdateInput,
    ) -> Result<outbound_shipment::update::UpdateResponse> {
        outbound_shipment::update::update(ctx, &store_id, input)
    }

    async fn update_outbound_shipment_name(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: outbound_shipment::update_name::UpdateNameInput,
    ) -> Result<outbound_shipment::update_name::UpdateNameResponse> {
        outbound_shipment::update_name::update_name(ctx, &store_id, input)
    }

    async fn delete_outbound_shipment(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        id: String,
    ) -> Result<outbound_shipment::delete::DeleteResponse> {
        outbound_shipment::delete::delete(ctx, &store_id, id)
    }

    async fn insert_inbound_shipment(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: inbound_shipment::insert::InsertInput,
    ) -> Result<inbound_shipment::insert::InsertResponse> {
        inbound_shipment::insert::insert(ctx, &store_id, input)
    }

    async fn update_inbound_shipment(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: inbound_shipment::update::UpdateInput,
    ) -> Result<inbound_shipment::update::UpdateResponse> {
        inbound_shipment::update::update(ctx, &store_id, input)
    }

    async fn delete_inbound_shipment(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: inbound_shipment::delete::DeleteInput,
    ) -> Result<inbound_shipment::delete::DeleteResponse> {
        inbound_shipment::delete::delete(ctx, &store_id, input)
    }

    /// Add invoice lines from master item master list
    async fn add_to_outbound_shipment_from_master_list(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: AddToShipmentFromMasterListInput,
    ) -> Result<outbound_shipment::AddFromMasterListResponse> {
        outbound_shipment::add_from_master_list(ctx, &store_id, input)
    }

    async fn add_to_inbound_shipment_from_master_list(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: AddToShipmentFromMasterListInput,
    ) -> Result<inbound_shipment::AddFromMasterListResponse> {
        inbound_shipment::add_from_master_list(ctx, &store_id, input)
    }

    async fn insert_prescription(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: prescription::insert::InsertInput,
    ) -> Result<prescription::insert::InsertResponse> {
        prescription::insert::insert(ctx, &store_id, input)
    }

    async fn update_prescription(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: prescription::update::UpdateInput,
    ) -> Result<prescription::update::UpdateResponse> {
        prescription::update::update(ctx, &store_id, input)
    }

    async fn delete_prescription(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        id: String,
    ) -> Result<prescription::delete::DeleteResponse> {
        prescription::delete::delete(ctx, &store_id, id)
    }

    async fn insert_supplier_return(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: supplier_return::insert::InsertInput,
    ) -> Result<supplier_return::insert::InsertResponse> {
        supplier_return::insert::insert(ctx, &store_id, input)
    }

    async fn update_supplier_return(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: supplier_return::update::UpdateInput,
    ) -> Result<supplier_return::update::UpdateResponse> {
        supplier_return::update::update(ctx, &store_id, input)
    }

    async fn update_supplier_return_other_party(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: supplier_return::update_other_party::UpdateOtherPartyInput,
    ) -> Result<supplier_return::update_other_party::UpdateOtherPartyResponse> {
        supplier_return::update_other_party::update_other_party(ctx, &store_id, input)
    }

    async fn update_supplier_return_lines(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: supplier_return::update_lines::UpdateInput,
    ) -> Result<supplier_return::update_lines::UpdateResponse> {
        supplier_return::update_lines::update_lines(ctx, &store_id, input)
    }

    async fn delete_supplier_return(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        id: String,
    ) -> Result<supplier_return::delete::DeleteResponse> {
        supplier_return::delete::delete(ctx, &store_id, id)
    }

    async fn insert_customer_return(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: customer_return::insert::InsertInput,
    ) -> Result<customer_return::insert::InsertResponse> {
        customer_return::insert::insert(ctx, &store_id, input)
    }

    async fn update_customer_return(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: customer_return::update::UpdateInput,
    ) -> Result<customer_return::update::UpdateResponse> {
        customer_return::update::update(ctx, &store_id, input)
    }

    async fn update_customer_return_lines(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        input: customer_return::update_lines::UpdateInput,
    ) -> Result<customer_return::update_lines::UpdateResponse> {
        customer_return::update_lines::update_lines(ctx, &store_id, input)
    }

    async fn delete_customer_return(
        &self,
        ctx: &Context<'_>,
        store_id: String,
        id: String,
    ) -> Result<customer_return::delete::DeleteResponse> {
        customer_return::delete::delete(ctx, &store_id, id)
    }
}
