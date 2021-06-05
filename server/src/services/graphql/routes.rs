//! src/services/graphql/routes.rs

use crate::services::graphql::schema::Schema;
use crate::utils::database::DatabaseConnection;

pub async fn graphql_route(
    req: actix_web::HttpRequest,
    payload: actix_web::web::Payload,
    schema: actix_web::web::Data<Schema>,
    context: actix_web::web::Data<DatabaseConnection>,
) -> Result<actix_web::HttpResponse, actix_web::Error> {
    juniper_actix::graphql_handler(&schema, &context, req, payload).await
}
