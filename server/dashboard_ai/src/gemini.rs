use anyhow::{Context, Result};
use reqwest::Client;
use rust_embed::RustEmbed;
use serde::{Deserialize, Serialize};

use crate::grafana::Datasource;

#[derive(Debug, Clone)]
pub(crate) struct GeminiClient {
    client: Client,
    api_key: String,
    base_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct GeminiContent {
    pub(crate) parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct GeminiPart {
    pub(crate) text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct GeminiRequest {
    pub(crate) contents: Vec<GeminiContent>,
    #[serde(rename = "systemInstruction")]
    pub(crate) system_instruction: Option<GeminiSystemInstruction>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct GeminiSystemInstruction {
    pub(crate) parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct GeminiGenerationConfig {
    #[serde(rename = "maxOutputTokens")]
    pub(crate) max_output_tokens: u32,
    pub(crate) temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct GeminiResponse {
    pub(crate) candidates: Vec<GeminiCandidate>,
    #[serde(rename = "usageMetadata")]
    pub(crate) usage_metadata: Option<GeminiUsageMetadata>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct GeminiCandidate {
    pub(crate) content: GeminiContent,
    #[serde(rename = "finishReason")]
    pub(crate) finish_reason: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct GeminiUsageMetadata {
    #[serde(rename = "promptTokenCount")]
    pub(crate) prompt_token_count: u32,
    #[serde(rename = "candidatesTokenCount")]
    pub(crate) candidates_token_count: u32,
    #[serde(rename = "totalTokenCount")]
    pub(crate) total_token_count: u32,
}

#[derive(RustEmbed)]
// Relative to repository/Cargo.toml
#[folder = "./assets"]
struct Assets;

fn get_asset_str(asset_name: &str) -> Result<String> {
    let asset_data = Assets::get(asset_name)
        .context(format!("Failed to read {} file from assets", asset_name))?
        .data;
    Ok(std::str::from_utf8(&asset_data)
        .context(format!("Failed to convert {} file to string", asset_name))?
        .to_string())
}

impl GeminiClient {
    pub(crate) fn new(api_key: String) -> Self {
        let client = Client::new();
        Self {
            client,
            api_key,
            base_url: "https://generativelanguage.googleapis.com".to_string(),
        }
    }

    /// Generate a Grafana dashboard based on a prompt and schema file
    pub(crate) async fn generate_dashboard(
        &self,
        prompt: &str,

        datasource: Datasource,
        dashboard_name: &str,
    ) -> Result<serde_json::Value> {
        let schema_content = get_asset_str("schema.sql").context("Failed to get schema sql")?;

        let dashboardexample1 =
            get_asset_str("dashboardexample1.json").context("Failed to get dashboard example 1")?;
        let dashboardexample2 =
            get_asset_str("dashboardexample2.json").context("Failed to get dashboard example 2")?;
        let dashboardexample3 =
            get_asset_str("dashboardexample3.json").context("Failed to get dashboard example 3")?;
        let dashboardexample4 =
            get_asset_str("dashboardexample4.json").context("Failed to get dashboard example 4")?;

        let system_prompt = r#"
You are an expert in Grafana dashboard with Postgresql datasource.

You are well versed in creating and modifying dashboards with all panels and visualizations that Grafana provides.

You will carefully examine provided database schema and example dashboards and use that knowledge when replying to prompts.

You will respond with a valid JSON object containing full dashboard object that can be imported into Grafana.

Make sure to enclose output json in "```json" and "```" so that it can be parsed correctly, this prompt is part of a workflow that will automatically insert this dashboard into grafana.

You will use variables where applicable.

You will use correct visualization for the data type returned by sql query.

You will provide multiple panels when creating new dashboard to satisfy the prompt to the best of your ability.

These dashboards will be used by a human so make sure all variables and other displays use human readable names and elements.

Make sure you understand all 4 dashboard examples provided, they are there to help you understand how to create a dashboard that is useful and informative.

Analyze the schema carefully and create queries that provide valuable insights into the database structure"#;

        let user_content = format!(
            "Please create a Grafana dashboard based on this request:\n\n{}\n\nUse this datasource ({}). Use this dashboard name ({}).\n\nHere is the PostgreSQL schema file:\n{}\n\nExample dashboard files:\n\nExample 1:\n{}\n\nExample 2:\n{}\n\nExample 3:\n{}\n\nExample 4:\n{}",
            prompt,
            datasource.uid,
            dashboard_name,
            schema_content,
            dashboardexample1,
            dashboardexample2,
            dashboardexample3,
            dashboardexample4
        );

        let request = GeminiRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart { text: user_content }],
            }],
            system_instruction: Some(GeminiSystemInstruction {
                parts: vec![GeminiPart {
                    text: system_prompt.to_string(),
                }],
            }),
        };

        let url = format!(
            "{}/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent?key={}",
            self.base_url, self.api_key
        );

        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .context("Failed to send request to Gemini API")?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Gemini API request failed with status {}: {}", status, body);
        }

        let text_response = response
            .text()
            .await
            .context("Failed to read response text from Gemini API")?;

        parse_dashboard_response(&text_response)
            .context("Failed to parse dashboard response from Gemini API, text response")
            .context(text_response)
    }
}

fn parse_dashboard_response(response: &str) -> Result<serde_json::Value> {
    let gemini_response: GeminiResponse =
        serde_json::from_str(&response).context("Failed to parse Gemini API response")?;

    // Extract the text content from Gemini's response
    let dashboard_json = gemini_response
        .candidates
        .first()
        .and_then(|candidate| candidate.content.parts.first())
        .map(|part| &part.text)
        .context("No text content found in Gemini response")?;

    // Split the response into JSON and other text
    let (dashboard_json, _other_text) = if let Some(start) = dashboard_json.find("```json") {
        let after_start = &dashboard_json[start + 7..]; // Skip "```json"
        if let Some(end) = after_start.find("```") {
            let json_content = after_start[..end].trim();
            let before = dashboard_json[..start].trim();
            let after = after_start[end + 3..].trim();
            let other = format!("{}\n{}", before, after).trim().to_string();
            (
                json_content.to_string(),
                if other.is_empty() { None } else { Some(other) },
            )
        } else {
            (dashboard_json.clone(), None)
        }
    } else if let Some(start) = dashboard_json.find("```") {
        let after_start = &dashboard_json[start + 3..];
        if let Some(end) = after_start.find("```") {
            let json_content = after_start[..end].trim();
            let before = dashboard_json[..start].trim();
            let after = after_start[end + 3..].trim();
            let other = format!("{}\n{}", before, after).trim().to_string();
            (
                json_content.to_string(),
                if other.is_empty() { None } else { Some(other) },
            )
        } else {
            (dashboard_json.clone(), None)
        }
    } else {
        (dashboard_json.clone(), None)
    };

    // Parse the JSON response from Gemini
    let dashboard: serde_json::Value = serde_json::from_str(&dashboard_json)
        .context("Failed to parse dashboard JSON from Gemini response")?;

    Ok(dashboard)
}
