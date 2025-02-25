use boa_engine::*;
use repository::{PluginDataFilter, PluginDataRepository, PluginDataRow};

use crate::backend_plugin::{boajs::utils::*, plugin_provider::PluginContext};

pub(crate) fn bind_method(context: &mut Context) -> Result<(), JsError> {
    context.register_global_callable(
        JsString::from("get_plugin_data"),
        0,
        NativeFunction::from_copy_closure(move |_, args, mut ctx| {
            // TODO Is this actually safe ? (need to check reference counts after plugin has run)
            let service_provider = PluginContext::service_provider();

            let filter: PluginDataFilter = get_serde_argument(&mut ctx, args, 0)?;

            let connection = service_provider
                .connection()
                .map_err(std_error_to_js_error)?;

            // TODO pagination or restrictions ?
            let plugin_data: Vec<PluginDataRow> = PluginDataRepository::new(&connection)
                .query_by_filter(filter)
                .map_err(std_error_to_js_error)?
                .into_iter()
                .map(|r| r.plugin_data)
                .collect();

            let value: serde_json::Value =
                serde_json::to_value(&plugin_data).map_err(std_error_to_js_error)?;
            // We return the moved variable as a `JsValue`.
            Ok(JsValue::from_json(&value, ctx)?)
        }),
    )?;
    Ok(())
}
