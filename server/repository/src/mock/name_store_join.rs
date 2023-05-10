use crate::NameStoreJoinRow;

use super::{mock_name_a, mock_name_store_a, mock_name_store_b, program_master_list_store};

pub fn mock_name_store_join_a() -> NameStoreJoinRow {
    NameStoreJoinRow {
        id: String::from("name_store_join_a"),
        name_id: String::from("name_store_a"),
        store_id: String::from("store_a"),
        name_is_customer: true,
        name_is_supplier: false,
    }
}

pub fn mock_name_store_join_b() -> NameStoreJoinRow {
    NameStoreJoinRow {
        id: String::from("name_store_join_b"),
        name_id: String::from("name_store_b"),
        store_id: String::from("store_a"),
        name_is_customer: true,
        name_is_supplier: false,
    }
}

pub fn mock_name_store_join_c() -> NameStoreJoinRow {
    NameStoreJoinRow {
        id: String::from("name_store_join_c"),
        name_id: String::from("name_store_c"),
        store_id: String::from("store_a"),
        name_is_customer: false,
        name_is_supplier: true,
    }
}

pub fn mock_name_store_join_d() -> NameStoreJoinRow {
    NameStoreJoinRow {
        id: String::from("mock_name_store_join_d"),
        name_id: String::from("name_a"),
        store_id: String::from("store_a"),
        name_is_customer: false,
        name_is_supplier: true,
    }
}

pub fn mock_name_store_join_e() -> NameStoreJoinRow {
    NameStoreJoinRow {
        id: String::from("mock_name_store_join_e"),
        name_id: String::from("name_a"),
        store_id: String::from("store_c"),
        name_is_customer: false,
        name_is_supplier: true,
    }
}

pub fn name_store_join_program_a() -> NameStoreJoinRow {
    NameStoreJoinRow {
        id: "mock_name_store_master_list_join_a".to_string(),
        store_id: program_master_list_store().id,
        name_id: mock_name_store_a().id,
        name_is_customer: true,
        name_is_supplier: false,
    }
}

pub fn name_store_join_program_b() -> NameStoreJoinRow {
    NameStoreJoinRow {
        id: "mock_name_store_master_list_join_b".to_string(),
        store_id: program_master_list_store().id,
        name_id: mock_name_store_b().id,
        name_is_customer: false,
        name_is_supplier: true,
    }
}

pub fn name_store_join_program_a_name_a() -> NameStoreJoinRow {
    NameStoreJoinRow {
        id: "mock_name_store_join_a_name_a".to_string(),
        store_id: program_master_list_store().id,
        name_id: mock_name_a().id,
        name_is_customer: false,
        name_is_supplier: true,
    }
}

pub fn mock_name_store_joins() -> Vec<NameStoreJoinRow> {
    vec![
        mock_name_store_join_a(),
        mock_name_store_join_b(),
        mock_name_store_join_c(),
        mock_name_store_join_d(),
        mock_name_store_join_e(),
        name_store_join_program_a(),
        name_store_join_program_b(),
        name_store_join_program_a_name_a(),
    ]
}
