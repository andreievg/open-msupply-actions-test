use super::{Connector, ConnectorError, NodeError, StockLineResponse};
use crate::{
    database::loader::StockLineByIdLoader, domain::invoice_line::InvoiceLine,
    server::service::graphql::ContextExt,
};
use async_graphql::*;
use chrono::NaiveDate;
use dataloader::DataLoader;

pub struct InvoiceLineNode {
    invoice_line: InvoiceLine,
}

#[Object]
impl InvoiceLineNode {
    pub async fn id(&self) -> &str {
        &self.invoice_line.id
    }
    pub async fn item_id(&self) -> &str {
        &self.invoice_line.item_id
    }
    pub async fn item_name(&self) -> &str {
        &self.invoice_line.item_name
    }
    pub async fn item_code(&self) -> &str {
        &self.invoice_line.item_code
    }
    pub async fn pack_size(&self) -> i32 {
        self.invoice_line.pack_size
    }
    pub async fn number_of_packs(&self) -> i32 {
        self.invoice_line.number_of_packs
    }
    pub async fn cost_price_per_pack(&self) -> f64 {
        self.invoice_line.cost_price_per_pack
    }
    pub async fn sell_price_per_pack(&self) -> f64 {
        self.invoice_line.sell_price_per_pack
    }
    pub async fn batch(&self) -> &Option<String> {
        &self.invoice_line.batch
    }
    pub async fn expiry_date(&self) -> &Option<NaiveDate> {
        &self.invoice_line.expiry_date
    }
    async fn stock_line(&self, ctx: &Context<'_>) -> Option<StockLineResponse> {
        let loader = ctx.get_loader::<DataLoader<StockLineByIdLoader>>();

        if let Some(invoice_line_id) = &self.invoice_line.stock_line_id {
            let result = match loader.load_one(invoice_line_id.clone()).await {
                Ok(response) => match response {
                    None => return None,
                    Some(result) => Ok(result),
                },
                Err(error) => Err(error),
            };

            Some(result.into())
        } else {
            None
        }
    }
}

type CurrentConnector = Connector<InvoiceLineNode>;

#[derive(Union)]
pub enum InvoiceLinesResponse {
    Error(ConnectorError),
    Response(CurrentConnector),
}

#[derive(Union)]
pub enum InvoiceLineResponse {
    Error(NodeError),
    Response(InvoiceLineNode),
}

impl<T, E> From<Result<T, E>> for InvoiceLinesResponse
where
    CurrentConnector: From<T>,
    ConnectorError: From<E>,
{
    fn from(result: Result<T, E>) -> Self {
        match result {
            Ok(response) => InvoiceLinesResponse::Response(response.into()),
            Err(error) => InvoiceLinesResponse::Error(error.into()),
        }
    }
}

impl<T, E> From<Result<T, E>> for InvoiceLineResponse
where
    InvoiceLineNode: From<T>,
    NodeError: From<E>,
{
    fn from(result: Result<T, E>) -> Self {
        match result {
            Ok(response) => InvoiceLineResponse::Response(response.into()),
            Err(error) => InvoiceLineResponse::Error(error.into()),
        }
    }
}

impl From<InvoiceLine> for InvoiceLineNode {
    /// number of pack available for a batch ("includes" numberOfPacks in this line)
    fn from(invoice_line: InvoiceLine) -> Self {
        InvoiceLineNode { invoice_line }
    }
}
