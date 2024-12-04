use async_graphql::*;

use graphql_core::{
    simple_generic_errors::{OtherPartyNotASupplier, OtherPartyNotVisible, RecordNotFound},
    standard_graphql_error::{validate_auth, StandardGraphqlError},
    ContextExt,
};
use graphql_types::types::InvoiceNode;
use repository::Invoice;
use service::auth::{Resource, ResourceAccessRequest};
use service::invoice::supplier_return::update_other_party::{
    UpdateSupplierReturnOtherParty as ServiceInput,
    UpdateSupplierReturnOtherPartyError as ServiceError,
};

use crate::mutations::outbound_shipment::error::InvoiceIsNotEditable;

#[derive(InputObject)]
#[graphql(name = "UpdateSupplierReturnOtherPartyInput")]
pub struct UpdateOtherPartyInput {
    pub id: String,
    other_party_id: Option<String>,
}

#[derive(SimpleObject)]
#[graphql(name = "UpdateSupplierReturnOtherPartyError")]
pub struct UpdateOtherPartyError {
    pub error: UpdateReturnOtherPartyErrorInterface,
}

#[derive(Union)]
#[graphql(name = "UpdateSupplierReturnOtherPartyResponse")]
pub enum UpdateOtherPartyResponse {
    Error(UpdateOtherPartyError),
    Response(InvoiceNode),
}

pub fn update_other_party(
    ctx: &Context<'_>,
    store_id: &str,
    input: UpdateOtherPartyInput,
) -> Result<UpdateOtherPartyResponse> {
    let user = validate_auth(
        ctx,
        &ResourceAccessRequest {
            resource: Resource::MutateSupplierReturn,
            store_id: Some(store_id.to_string()),
        },
    )?;

    let service_provider = ctx.service_provider();
    let service_context = service_provider.context(store_id.to_string(), user.user_id)?;

    map_response(
        service_provider
            .invoice_service
            .update_supplier_return_other_party(&service_context, input.to_domain()),
    )
}

#[derive(Interface)]
#[graphql(field(name = "description", ty = "String"))]
pub enum UpdateReturnOtherPartyErrorInterface {
    InvoiceDoesNotExist(RecordNotFound),
    InvoiceIsNotEditable(InvoiceIsNotEditable),
    OtherPartyNotASupplier(OtherPartyNotASupplier),
    OtherPartyNotVisible(OtherPartyNotVisible),
}

impl UpdateOtherPartyInput {
    pub fn to_domain(self) -> ServiceInput {
        let UpdateOtherPartyInput { id, other_party_id } = self;

        ServiceInput { id, other_party_id }
    }
}

pub fn map_response(from: Result<Invoice, ServiceError>) -> Result<UpdateOtherPartyResponse> {
    let result = match from {
        Ok(invoice_line) => {
            UpdateOtherPartyResponse::Response(InvoiceNode::from_domain(invoice_line))
        }
        Err(error) => UpdateOtherPartyResponse::Error(UpdateOtherPartyError {
            error: map_error(error)?,
        }),
    };

    Ok(result)
}

fn map_error(error: ServiceError) -> Result<UpdateReturnOtherPartyErrorInterface> {
    use StandardGraphqlError::*;
    let formatted_error = format!("{:#?}", error);

    let graphql_error = match error {
        ServiceError::InvoiceDoesNotExist => {
            return Ok(UpdateReturnOtherPartyErrorInterface::InvoiceDoesNotExist(
                RecordNotFound {},
            ))
        }
        ServiceError::InvoiceIsNotEditable => {
            return Ok(UpdateReturnOtherPartyErrorInterface::InvoiceIsNotEditable(
                InvoiceIsNotEditable,
            ))
        }
        ServiceError::OtherPartyNotASupplier => {
            return Ok(
                UpdateReturnOtherPartyErrorInterface::OtherPartyNotASupplier(
                    OtherPartyNotASupplier,
                ),
            )
        }
        ServiceError::OtherPartyNotVisible => {
            return Ok(UpdateReturnOtherPartyErrorInterface::OtherPartyNotVisible(
                OtherPartyNotVisible,
            ))
        }
        ServiceError::NotAnSupplierReturn
        | ServiceError::NotThisStoreInvoice
        | ServiceError::OtherPartyDoesNotExist => BadUserInput(formatted_error),
        ServiceError::DatabaseError(_) | ServiceError::UpdatedInvoiceDoesNotExist => {
            InternalError(formatted_error)
        }
    };

    Err(graphql_error.extend())
}

#[cfg(test)]
mod test {
    use async_graphql::EmptyMutation;
    use graphql_core::{
        assert_graphql_query, assert_standard_graphql_error, test_helpers::setup_graphql_test,
    };
    use repository::{
        mock::{mock_name_store_a, mock_store_a, mock_supplier_return_a, MockDataInserts},
        Invoice, RepositoryError, StorageConnectionManager,
    };
    use serde_json::json;
    use service::{
        invoice::{
            supplier_return::update_other_party::{
                UpdateSupplierReturnOtherParty as ServiceInput,
                UpdateSupplierReturnOtherPartyError as ServiceError,
            },
            InvoiceServiceTrait,
        },
        service_provider::{ServiceContext, ServiceProvider},
    };

    use crate::InvoiceMutations;

    type InsertMethod = dyn Fn(ServiceInput) -> Result<Invoice, ServiceError> + Sync + Send;

    pub struct TestService(pub Box<InsertMethod>);

    impl InvoiceServiceTrait for TestService {
        fn update_supplier_return_other_party(
            &self,
            _: &ServiceContext,
            input: ServiceInput,
        ) -> Result<Invoice, ServiceError> {
            self.0(input)
        }
    }

    fn service_provider(
        test_service: TestService,
        connection_manager: &StorageConnectionManager,
    ) -> ServiceProvider {
        let mut service_provider = ServiceProvider::new(connection_manager.clone());
        service_provider.invoice_service = Box::new(test_service);
        service_provider
    }

    fn empty_variables() -> serde_json::Value {
        json!({
          "input": {
            "id": "n/a",
            "otherPartyId": "n/a",
          }
        })
    }

    #[actix_rt::test]
    async fn test_graphql_update_supplier_name_errors() {
        let (_, _, connection_manager, settings) = setup_graphql_test(
            EmptyMutation,
            InvoiceMutations,
            "test_graphql_update_supplier_name_errors",
            MockDataInserts::all(),
        )
        .await;

        let mutation = r#"
        mutation ($input: UpdateSupplierReturnOtherPartyInput!) {
            updateSupplierReturnOtherParty(input: $input, storeId: \"store_a\") {
                ... on UpdateSupplierReturnOtherPartyError {
                    error {
                        __typename
                    }
                }
            }
        }
        "#;

        // InvoiceDoesNotExist
        let test_service = TestService(Box::new(|_| Err(ServiceError::InvoiceDoesNotExist)));

        let expected = json!({
            "updateSupplierReturnOtherParty": {
              "error": {
                "__typename": "RecordNotFound"
              }
            }
          }
        );

        assert_graphql_query!(
            &settings,
            mutation,
            &Some(empty_variables()),
            &expected,
            Some(service_provider(test_service, &connection_manager))
        );

        // OtherPartyNotASupplier
        let test_service = TestService(Box::new(|_| Err(ServiceError::OtherPartyNotASupplier)));

        let expected = json!({
            "updateSupplierReturnOtherParty": {
              "error": {
                "__typename": "OtherPartyNotASupplier"
              }
            }
          }
        );

        assert_graphql_query!(
            &settings,
            mutation,
            &Some(empty_variables()),
            &expected,
            Some(service_provider(test_service, &connection_manager))
        );

        // OtherPartyNotVisible
        let test_service = TestService(Box::new(|_| Err(ServiceError::OtherPartyNotVisible)));

        let expected = json!({
            "updateSupplierReturnOtherParty" : {
                "error": {
                    "__typename": "OtherPartyNotVisible"
                }
            }
        });

        assert_graphql_query!(
            &settings,
            mutation,
            &Some(empty_variables()),
            &expected,
            Some(service_provider(test_service, &connection_manager))
        );

        // NotThisStoreInvoice
        let test_service = TestService(Box::new(|_| Err(ServiceError::NotThisStoreInvoice)));
        let expected_message = "Bad user input";
        assert_standard_graphql_error!(
            &settings,
            &mutation,
            &Some(empty_variables()),
            &expected_message,
            None,
            Some(service_provider(test_service, &connection_manager))
        );

        // NotAnSupplierReturn
        let test_service = TestService(Box::new(|_| Err(ServiceError::NotAnSupplierReturn)));
        let expected_message = "Bad user input";
        assert_standard_graphql_error!(
            &settings,
            &mutation,
            &Some(empty_variables()),
            &expected_message,
            None,
            Some(service_provider(test_service, &connection_manager))
        );

        // OtherPartyDoesNotExist
        let test_service = TestService(Box::new(|_| Err(ServiceError::OtherPartyDoesNotExist)));
        let expected_message = "Bad user input";
        assert_standard_graphql_error!(
            &settings,
            &mutation,
            &Some(empty_variables()),
            &expected_message,
            None,
            Some(service_provider(test_service, &connection_manager))
        );

        // DatabaseError
        let test_service = TestService(Box::new(|_| {
            Err(ServiceError::DatabaseError(
                RepositoryError::UniqueViolation("row already exists".to_string()),
            ))
        }));
        let expected_message = "Internal error";
        assert_standard_graphql_error!(
            &settings,
            &mutation,
            &Some(empty_variables()),
            &expected_message,
            None,
            Some(service_provider(test_service, &connection_manager))
        );
    }

    #[actix_rt::test]
    async fn test_graphql_update_supplier_return_other_party_success() {
        let (_, _, connection_manager, settings) = setup_graphql_test(
            EmptyMutation,
            InvoiceMutations,
            "test_graphql_update_supplier_return_other_party_success",
            MockDataInserts::all(),
        )
        .await;

        let mutation = r#"
            mutation ($storeId: String, $input: UpdateSupplierReturnOtherPartyInput!) {
                updateSupplierReturnOtherParty(storeId: $storeId, input: $input) {
                    ... on InvoiceNode {
                        id
                        otherPartyId
                    }
                    ... on UpdateSupplierReturnOtherPartyError {
                        error {
                          __typename
                        }
                      }
                }
              }
            "#;

        // Success
        let test_service = TestService(Box::new(|input| {
            assert_eq!(
                input,
                ServiceInput {
                    id: "id input".to_string(),
                    other_party_id: Some("other party input".to_string()),
                }
            );
            Ok(Invoice {
                invoice_row: mock_supplier_return_a(),
                name_row: mock_name_store_a(),
                store_row: mock_store_a(),
                clinician_row: None,
            })
        }));

        let variables = json!({
          "input": {
            "id": "id input",
            "otherPartyId": "other party input",
          },
          "storeId": "store_b"
        });

        let expected = json!({
            "updateSupplierReturnOtherParty": {
                "id": mock_supplier_return_a().id,
                "otherPartyId": mock_name_store_a().id,
            }
          }
        );

        assert_graphql_query!(
            &settings,
            mutation,
            &Some(variables),
            &expected,
            Some(service_provider(test_service, &connection_manager))
        );
    }
}
