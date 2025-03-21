use super::{
    master_list_name_join::master_list_name_join::dsl as master_list_name_join_dsl,
    master_list_row::{master_list, master_list::dsl as master_list_dsl},
    name_row::name::dsl as name_dsl,
    program_row::program::dsl as program_dsl,
    store_row::store::dsl as store_dsl,
    DBType, MasterListRow, StorageConnection,
};

use crate::{
    diesel_macros::{apply_equal_filter, apply_simple_string_filter, apply_sort_no_case},
    repository_error::RepositoryError,
};

use crate::{EqualFilter, Pagination, SimpleStringFilter, Sort};

use diesel::prelude::*;

pub type MasterList = MasterListRow;

pub struct MasterListRepository<'a> {
    connection: &'a StorageConnection,
}

#[derive(Clone, Debug, PartialEq)]
pub struct MasterListFilter {
    pub id: Option<EqualFilter<String>>,
    pub name: Option<SimpleStringFilter>,
    pub code: Option<SimpleStringFilter>,
    pub description: Option<SimpleStringFilter>,
    pub exists_for_name: Option<SimpleStringFilter>,
    pub exists_for_name_id: Option<EqualFilter<String>>,
    pub exists_for_store_id: Option<EqualFilter<String>>,
    pub is_program: Option<bool>,
}

pub enum MasterListSortField {
    Name,
    Code,
    Description,
}

pub type MasterListSort = Sort<MasterListSortField>;

impl<'a> MasterListRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        MasterListRepository { connection }
    }

    pub fn count(&self, filter: Option<MasterListFilter>) -> Result<i64, RepositoryError> {
        // TODO (beyond M1), check that store_id matches current store
        let query = Self::create_filtered_query(filter);

        Ok(query.count().get_result(&self.connection.connection)?)
    }

    pub fn query_by_filter(
        &self,
        filter: MasterListFilter,
    ) -> Result<Vec<MasterList>, RepositoryError> {
        self.query(Pagination::new(), Some(filter), None)
    }

    pub fn create_filtered_query(filter: Option<MasterListFilter>) -> BoxedMasterListQuery {
        let mut query = master_list_dsl::master_list.into_boxed();

        if let Some(f) = filter {
            apply_equal_filter!(query, f.id, master_list_dsl::id);
            apply_simple_string_filter!(query, f.name, master_list_dsl::name);
            apply_simple_string_filter!(query, f.code, master_list_dsl::code);
            apply_simple_string_filter!(query, f.description, master_list_dsl::description);

            // Result master list should be unique, which would need extra logic if we were to join
            // name table through master_list_name_join, thus use a sub query to restrict the resulting
            // master_list_ids in 'any' filter
            if f.exists_for_name.is_some()
                || f.exists_for_name_id.is_some()
                || f.exists_for_store_id.is_some()
            {
                let mut name_join_query = master_list_name_join_dsl::master_list_name_join
                    .select(master_list_name_join_dsl::master_list_id)
                    .distinct()
                    .left_join(name_dsl::name.left_join(store_dsl::store))
                    .into_boxed();

                apply_simple_string_filter!(name_join_query, f.exists_for_name, name_dsl::name_);
                apply_equal_filter!(name_join_query, f.exists_for_name_id, name_dsl::id);
                apply_equal_filter!(name_join_query, f.exists_for_store_id, store_dsl::id);

                query = query.filter(master_list_dsl::id.eq_any(name_join_query));
            }

            if let Some(is_program) = f.is_program {
                let program_join_query = program_dsl::program
                    .select(program_dsl::master_list_id)
                    .distinct()
                    .into_boxed();

                if is_program {
                    query = query.filter(master_list_dsl::id.eq_any(program_join_query));
                } else {
                    query = query.filter(master_list_dsl::id.ne_all(program_join_query));
                }
            }
        }

        query
    }

    pub fn query(
        &self,
        pagination: Pagination,
        filter: Option<MasterListFilter>,
        sort: Option<MasterListSort>,
    ) -> Result<Vec<MasterList>, RepositoryError> {
        // TODO (beyond M1), check that store_id matches current store
        let mut query = Self::create_filtered_query(filter);

        if let Some(sort) = sort {
            match sort.key {
                MasterListSortField::Name => {
                    apply_sort_no_case!(query, sort, master_list_dsl::name);
                }
                MasterListSortField::Code => {
                    apply_sort_no_case!(query, sort, master_list_dsl::code);
                }
                MasterListSortField::Description => {
                    apply_sort_no_case!(query, sort, master_list_dsl::description);
                }
            }
        } else {
            query = query.order(master_list_dsl::id.asc())
        }

        let result = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64)
            .load::<MasterListRow>(&self.connection.connection)?;

        Ok(result)
    }
}

type BoxedMasterListQuery = master_list::BoxedQuery<'static, DBType>;

impl MasterListFilter {
    pub fn new() -> MasterListFilter {
        MasterListFilter {
            id: None,
            name: None,
            code: None,
            description: None,
            exists_for_name: None,
            exists_for_name_id: None,
            exists_for_store_id: None,
            is_program: None,
        }
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn code(mut self, filter: SimpleStringFilter) -> Self {
        self.code = Some(filter);
        self
    }

    pub fn name(mut self, filter: SimpleStringFilter) -> Self {
        self.name = Some(filter);
        self
    }

    pub fn description(mut self, filter: SimpleStringFilter) -> Self {
        self.description = Some(filter);
        self
    }

    pub fn exists_for_name(mut self, filter: SimpleStringFilter) -> Self {
        self.exists_for_name = Some(filter);
        self
    }

    pub fn exists_for_name_id(mut self, filter: EqualFilter<String>) -> Self {
        self.exists_for_name_id = Some(filter);
        self
    }

    pub fn exists_for_store_id(mut self, filter: EqualFilter<String>) -> Self {
        self.exists_for_store_id = Some(filter);
        self
    }

    pub fn is_program(mut self, filter: bool) -> Self {
        self.is_program = Some(filter);
        self
    }
}
