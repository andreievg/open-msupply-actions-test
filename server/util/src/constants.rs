use chrono::Duration;

/// Code for the special inventory adjustment name
pub const INVENTORY_ADJUSTMENT_NAME_CODE: &str = "invad";
/// Code for the special repack name
pub const REPACK_NAME_CODE: &str = "repack";
/// Number of days in a month (used in AMC calculation)
pub const NUMBER_OF_DAYS_IN_A_MONTH: f64 = 30.0;
/// For use when service item is not specified in service invoice line
pub const DEFAULT_SERVICE_ITEM_CODE: &str = "service";
/// System names to not be included in name query
pub const SYSTEM_NAME_CODES: &[&'static str] = &["invad", "build", "repack"];
/// Stock line issue expiry warning offset from now
pub fn stock_line_expiring_soon_offset() -> Duration {
    Duration::weeks(6)
}
/// Expected delivery date offset (for request requisition insert)
pub fn expected_delivery_date_offset() -> Duration {
    Duration::weeks(2)
}
/// Default AMC calculation lookback
pub const DEFAULT_AMC_LOOKBACK_MONTHS: u32 = 3;
// System user
pub const SYSTEM_USER_ID: &str = "omsupply_system";
// Missing program
// TODO: Delete when soft delete for master list is implemented
pub const MISSING_PROGRAM: &str = "missing_program";
