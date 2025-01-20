use super::{
    barcode_row::barcode, name_link_row::name_link, name_row::name, BarcodeRow, DBType,
    NameLinkRow, NameRow, StorageConnection,
};
use diesel::{
    helper_types::{InnerJoin, IntoBoxed, LeftJoin},
    prelude::*,
};

use crate::{
    diesel_macros::{apply_equal_filter, apply_sort_no_case},
    repository_error::RepositoryError,
};

use crate::{EqualFilter, Pagination, Sort};

#[derive(PartialEq, Debug, Clone)]
pub struct Barcode {
    pub barcode_row: BarcodeRow,
    pub manufacturer_name_row: Option<NameRow>,
}

#[derive(Clone, PartialEq, Debug, Default)]
pub struct BarcodeFilter {
    pub id: Option<EqualFilter<String>>,
    pub gtin: Option<EqualFilter<String>>,
    pub item_id: Option<EqualFilter<String>>,
    pub pack_size: Option<EqualFilter<f64>>,
}

#[derive(PartialEq, Debug)]
pub enum BarcodeSortField {
    Id,
    Barcode,
}

pub type BarcodeSort = Sort<BarcodeSortField>;
type BarcodeJoin = (BarcodeRow, Option<(NameLinkRow, NameRow)>);

pub struct BarcodeRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> BarcodeRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        BarcodeRepository { connection }
    }

    pub fn count(&self, filter: Option<BarcodeFilter>) -> Result<i64, RepositoryError> {
        let query = create_filtered_query(filter);
        Ok(query
            .count()
            .get_result(self.connection.lock().connection())?)
    }

    pub fn query_by_filter(&self, filter: BarcodeFilter) -> Result<Vec<Barcode>, RepositoryError> {
        self.query(Pagination::all(), Some(filter), None)
    }

    pub fn query(
        &self,
        pagination: Pagination,
        filter: Option<BarcodeFilter>,
        sort: Option<BarcodeSort>,
    ) -> Result<Vec<Barcode>, RepositoryError> {
        let mut query = create_filtered_query(filter);
        if let Some(sort) = sort {
            match sort.key {
                BarcodeSortField::Id => {
                    apply_sort_no_case!(query, sort, barcode::id)
                }
                BarcodeSortField::Barcode => {
                    apply_sort_no_case!(query, sort, barcode::gtin)
                }
            }
        } else {
            query = query.order(barcode::gtin.asc())
        }

        let result = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64)
            .load::<BarcodeJoin>(self.connection.lock().connection())?;

        Ok(result.into_iter().map(to_domain).collect())
    }
}

type BoxedBarcodeQuery =
    IntoBoxed<'static, LeftJoin<barcode::table, InnerJoin<name_link::table, name::table>>, DBType>;

fn create_filtered_query(filter: Option<BarcodeFilter>) -> BoxedBarcodeQuery {
    let mut query = barcode::table
        .left_join(name_link::table.inner_join(name::table))
        .into_boxed();

    if let Some(filter) = filter {
        apply_equal_filter!(query, filter.id, barcode::id);
        apply_equal_filter!(query, filter.gtin, barcode::gtin);
        apply_equal_filter!(query, filter.item_id, barcode::item_id);
        apply_equal_filter!(query, filter.pack_size, barcode::pack_size);
    }

    query
}

fn to_domain((barcode_row, name_link): BarcodeJoin) -> Barcode {
    Barcode {
        barcode_row,
        manufacturer_name_row: name_link.map(|(_, name)| name),
    }
}

impl BarcodeFilter {
    pub fn new() -> BarcodeFilter {
        Self::default()
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn gtin(mut self, filter: EqualFilter<String>) -> Self {
        self.gtin = Some(filter);
        self
    }

    pub fn item_id(mut self, filter: EqualFilter<String>) -> Self {
        self.item_id = Some(filter);
        self
    }

    pub fn pack_size(mut self, filter: EqualFilter<f64>) -> Self {
        self.pack_size = Some(filter);
        self
    }
}
