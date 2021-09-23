use crate::database::schema::{CentralSyncBufferRow, ItemRow};

use serde::Deserialize;

#[allow(non_snake_case)]
#[derive(Deserialize)]
pub struct LegacyItemRow {
    ID: String,
    item_name: String,
    code: String,
}

impl LegacyItemRow {
    pub fn try_translate(
        sync_record: &CentralSyncBufferRow,
    ) -> Result<Option<ItemRow>, serde_json::Error> {
        if sync_record.table_name != "item" {
            return Ok(None);
        }
        let data = serde_json::from_str::<LegacyItemRow>(&sync_record.data)?;

        Ok(Some(ItemRow {
            id: data.ID,
            name: data.item_name,
            code: data.code,
        }))
    }
}

#[cfg(test)]
mod tests {
    use crate::util::sync::translation::{
        item::LegacyItemRow,
        test_data::{item::get_test_item_records, TestSyncDataRecord},
    };

    #[test]
    fn test_item_translation() {
        for record in get_test_item_records() {
            match record.translated_record {
                TestSyncDataRecord::Item(translated_record) => {
                    assert_eq!(
                        LegacyItemRow::try_translate(&record.central_sync_buffer_row).unwrap(),
                        translated_record,
                        "{}",
                        record.identifier
                    )
                }
                _ => panic!("Testing wrong record type {:#?}", record.translated_record),
            }
        }
    }
}
