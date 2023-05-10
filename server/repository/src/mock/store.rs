use util::inline_init;

use crate::StoreRow;

use super::mock_program_master_list_test;

pub fn mock_store_a() -> StoreRow {
    inline_init(|s: &mut StoreRow| {
        s.id = "store_a".to_string();
        s.name_id = "name_store_a".to_string();
        s.code = "code".to_string();
    })
}

pub fn mock_store_b() -> StoreRow {
    inline_init(|s: &mut StoreRow| {
        s.id = "store_b".to_string();
        s.name_id = "name_store_b".to_string();
        s.code = "code".to_string();
        s.site_id = 2;
    })
}

pub fn mock_store_c() -> StoreRow {
    inline_init(|s: &mut StoreRow| {
        s.id = "store_c".to_string();
        s.name_id = "name_store_c".to_string();
        s.code = "code".to_string();
    })
}

pub fn program_master_list_store() -> StoreRow {
    inline_init(|s: &mut StoreRow| {
        s.id = "program_master_list_store".to_string();
        s.name_id = mock_program_master_list_test().id;
        s.code = mock_program_master_list_test().code;
    })
}

pub fn mock_stores() -> Vec<StoreRow> {
    vec![
        mock_store_a(),
        mock_store_b(),
        mock_store_c(),
        program_master_list_store(),
    ]
}
