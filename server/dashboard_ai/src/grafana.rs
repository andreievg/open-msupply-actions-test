use anyhow::{Context, Result};
use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub(crate) struct GrafanaClient {
    client: Client,
    base_url: String,
    api_key: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub(crate) struct Dashboard {
    pub(crate) id: Option<u64>,
    pub(crate) uid: Option<String>,
    pub(crate) title: String,
    pub(crate) tags: Vec<String>,
    pub(crate) timezone: String,
    pub(crate) panels: Vec<serde_json::Value>,
    pub(crate) time: TimeRange,
    pub(crate) refresh: String,
    #[serde(flatten)]
    pub(crate) extra_fields: std::collections::HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub(crate) struct TimeRange {
    pub(crate) from: String,
    pub(crate) to: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct DashboardListItem {
    pub(crate) id: u64,
    pub(crate) uid: String,
    pub(crate) title: String,
    pub(crate) uri: String,
    pub(crate) url: String,
    pub(crate) slug: String,
    pub(crate) starred: bool,
    pub(crate) tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct DashboardSearchResponse {
    pub(crate) id: u64,
    pub(crate) uid: String,
    pub(crate) title: String,
    pub(crate) tags: Vec<String>,
    pub(crate) uri: String,
    pub(crate) url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct DashboardResponse {
    pub(crate) meta: DashboardMeta,
    pub(crate) dashboard: Dashboard,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct DashboardMeta {
    #[serde(rename = "type")]
    pub(crate) meta_type: String,
    #[serde(rename = "canSave")]
    pub(crate) can_save: bool,
    #[serde(rename = "canEdit")]
    pub(crate) can_edit: bool,
    #[serde(rename = "canAdmin")]
    pub(crate) can_admin: bool,
    #[serde(rename = "canStar")]
    pub(crate) can_star: bool,
    pub(crate) slug: String,
    pub(crate) url: String,
    pub(crate) expires: String,
    pub(crate) created: String,
    pub(crate) updated: String,
    #[serde(rename = "updatedBy")]
    pub(crate) updated_by: String,
    #[serde(rename = "createdBy")]
    pub(crate) created_by: String,
    pub(crate) version: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct DashboardUpsertRequest {
    pub(crate) dashboard: Dashboard,
    #[serde(rename = "folderId")]
    pub(crate) folder_id: Option<u64>,
    pub(crate) message: Option<String>,
    pub(crate) overwrite: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct DashboardUpsertResponse {
    pub(crate) id: u64,
    pub(crate) uid: String,
    pub(crate) url: String,
    pub(crate) status: String,
    pub(crate) version: u32,
    pub(crate) slug: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct QueryResponse {
    pub(crate) data: Vec<QueryResult>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct QueryResult {
    pub(crate) target: HashMap<String, serde_json::Value>,
    pub(crate) datapoints: Vec<[Option<f64>; 2]>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct Datasource {
    pub(crate) id: u64,
    pub(crate) uid: String,
    pub(crate) name: String,
    #[serde(rename = "type")]
    pub(crate) datasource_type: String,
    pub(crate) url: String,
    pub(crate) access: String,
    #[serde(rename = "isDefault")]
    pub(crate) is_default: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct QueryRequest {
    pub(crate) queries: Vec<QueryTarget>,
    pub(crate) from: String,
    pub(crate) to: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct QueryTarget {
    #[serde(rename = "refId")]
    pub(crate) ref_id: String,
    pub(crate) expr: Option<String>,
    pub(crate) query: Option<String>,
    pub(crate) datasource: DatasourceRef,
    #[serde(rename = "intervalMs")]
    pub(crate) interval_ms: Option<u64>,
    #[serde(rename = "maxDataPoints")]
    pub(crate) max_data_points: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct DatasourceRef {
    #[serde(rename = "type")]
    pub(crate) datasource_type: String,
    pub(crate) uid: String,
}

impl GrafanaClient {
    pub(crate) fn new(base_url: String, api_key: String) -> Self {
        let client = Client::new();
        Self {
            client,
            base_url: base_url.trim_end_matches('/').to_string(),
            api_key,
        }
    }

    fn build_headers(&self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            "Authorization",
            format!("Bearer {}", self.api_key).parse().unwrap(),
        );
        headers.insert("Content-Type", "application/json".parse().unwrap());
        headers
    }

    /// Create or update a dashboard
    pub(crate) async fn upsert_dashboard(
        &self,
        dashboard: Dashboard,
        folder_id: Option<u64>,
        message: Option<String>,
        overwrite: bool,
    ) -> Result<DashboardUpsertResponse> {
        let url = format!("{}/api/dashboards/db", self.base_url);

        let request = DashboardUpsertRequest {
            dashboard,
            folder_id,
            message,
            overwrite,
        };

        let response = self
            .client
            .post(&url)
            .headers(self.build_headers())
            .json(&request)
            .send()
            .await
            .context("Failed to send request to upsert dashboard")?;

        self.handle_response(response).await
    }

    /// List all datasources
    pub(crate) async fn list_datasources(&self) -> Result<Vec<Datasource>> {
        let url = format!("{}/api/datasources", self.base_url);

        let response = self
            .client
            .get(&url)
            .headers(self.build_headers())
            .send()
            .await
            .context("Failed to send request to list datasources")?;

        self.handle_response(response).await
    }

    /// Get the default datasource
    pub(crate) async fn get_default_datasource(&self) -> Result<Datasource> {
        let datasources = self.list_datasources().await?;
        datasources
            .into_iter()
            .find(|ds| ds.is_default)
            .context("No default datasource found")
    }

    /// Generic response handler
    async fn handle_response<T>(&self, response: Response) -> Result<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        if response.status().is_success() {
            let body = response
                .text()
                .await
                .context("Failed to read response body")?;

            serde_json::from_str(&body).context("Failed to deserialize response JSON")
        } else {
            let status = response.status();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "Failed to read error body".to_string());

            anyhow::bail!("HTTP {}: {}", status, body)
        }
    }
}
