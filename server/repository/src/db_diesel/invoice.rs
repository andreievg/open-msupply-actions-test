use super::{
    invoice_row::{invoice, invoice::dsl as invoice_dsl},
    name_row::{name, name::dsl as name_dsl},
    store_row::{store, store::dsl as store_dsl},
    DBType, InvoiceRow, InvoiceRowStatus, InvoiceRowType, NameRow, RepositoryError,
    StorageConnection, StoreRow,
};

use crate::diesel_macros::{
    apply_date_time_filter, apply_equal_filter, apply_simple_string_filter, apply_sort,
    apply_sort_no_case,
};

use crate::{DatetimeFilter, EqualFilter, Pagination, SimpleStringFilter, Sort};

use diesel::{
    dsl::{InnerJoin, IntoBoxed},
    prelude::*,
};
use util::inline_init;

#[derive(PartialEq, Debug, Clone, Default)]
pub struct Invoice {
    pub invoice_row: InvoiceRow,
    pub name_row: NameRow,
    pub store_row: StoreRow,
}
#[derive(Clone, Default)]
pub struct InvoiceFilter {
    pub id: Option<EqualFilter<String>>,
    pub invoice_number: Option<EqualFilter<i64>>,
    pub name_id: Option<EqualFilter<String>>,
    pub name: Option<SimpleStringFilter>,
    pub store_id: Option<EqualFilter<String>>,
    pub user_id: Option<EqualFilter<String>>,
    pub r#type: Option<EqualFilter<InvoiceRowType>>,
    pub status: Option<EqualFilter<InvoiceRowStatus>>,
    pub on_hold: Option<bool>,
    pub comment: Option<SimpleStringFilter>,
    pub their_reference: Option<EqualFilter<String>>,
    pub transport_reference: Option<EqualFilter<String>>,
    pub created_datetime: Option<DatetimeFilter>,
    pub allocated_datetime: Option<DatetimeFilter>,
    pub picked_datetime: Option<DatetimeFilter>,
    pub shipped_datetime: Option<DatetimeFilter>,
    pub delivered_datetime: Option<DatetimeFilter>,
    pub verified_datetime: Option<DatetimeFilter>,
    pub colour: Option<EqualFilter<String>>,
    pub requisition_id: Option<EqualFilter<String>>,
    pub linked_invoice_id: Option<EqualFilter<String>>,
}

pub enum InvoiceSortField {
    Type,
    OtherPartyName,
    InvoiceNumber,
    Comment,
    Status,
    CreatedDatetime,
    AllocatedDatetime,
    PickedDatetime,
    ShippedDatetime,
    DeliveredDatetime,
    VerifiedDatetime,
    TheirReference,
    TransportReference,
}

pub type InvoiceSort = Sort<InvoiceSortField>;

pub struct InvoiceRepository<'a> {
    connection: &'a StorageConnection,
}

type InvoiceJoin = (InvoiceRow, NameRow, StoreRow);

impl<'a> InvoiceRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        InvoiceRepository { connection }
    }

    pub fn count(&self, filter: Option<InvoiceFilter>) -> Result<i64, RepositoryError> {
        // TODO (beyond M1), check that store_id matches current store
        let query = create_filtered_query(filter);

        Ok(query.count().get_result(&self.connection.connection)?)
    }

    pub fn query_by_filter(&self, filter: InvoiceFilter) -> Result<Vec<Invoice>, RepositoryError> {
        self.query(Pagination::all(), Some(filter), None)
    }

    pub fn query_one(&self, filter: InvoiceFilter) -> Result<Option<Invoice>, RepositoryError> {
        Ok(self.query_by_filter(filter)?.pop())
    }

    /// Gets all invoices
    pub fn query(
        &self,
        pagination: Pagination,
        filter: Option<InvoiceFilter>,
        sort: Option<InvoiceSort>,
    ) -> Result<Vec<Invoice>, RepositoryError> {
        let mut query = create_filtered_query(filter);

        if let Some(sort) = sort {
            match sort.key {
                InvoiceSortField::Type => {
                    apply_sort!(query, sort, invoice_dsl::type_);
                }
                InvoiceSortField::Status => {
                    apply_sort!(query, sort, invoice_dsl::status);
                }
                InvoiceSortField::CreatedDatetime => {
                    apply_sort!(query, sort, invoice_dsl::created_datetime);
                }
                InvoiceSortField::AllocatedDatetime => {
                    apply_sort!(query, sort, invoice_dsl::allocated_datetime);
                }
                InvoiceSortField::PickedDatetime => {
                    apply_sort!(query, sort, invoice_dsl::picked_datetime);
                }
                InvoiceSortField::ShippedDatetime => {
                    apply_sort!(query, sort, invoice_dsl::shipped_datetime);
                }
                InvoiceSortField::DeliveredDatetime => {
                    apply_sort!(query, sort, invoice_dsl::delivered_datetime);
                }
                InvoiceSortField::VerifiedDatetime => {
                    apply_sort!(query, sort, invoice_dsl::verified_datetime);
                }
                InvoiceSortField::OtherPartyName => {
                    apply_sort_no_case!(query, sort, name_dsl::name_);
                }
                InvoiceSortField::InvoiceNumber => {
                    apply_sort!(query, sort, invoice_dsl::invoice_number);
                }
                InvoiceSortField::Comment => {
                    apply_sort_no_case!(query, sort, invoice_dsl::comment);
                }
                InvoiceSortField::TheirReference => {
                    apply_sort_no_case!(query, sort, invoice_dsl::their_reference);
                }
                InvoiceSortField::TransportReference => {
                    apply_sort_no_case!(query, sort, invoice_dsl::transport_reference);
                }
            }
        } else {
            query = query.order(invoice_dsl::id.asc())
        }

        let result = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64)
            .load::<InvoiceJoin>(&self.connection.connection)?;

        Ok(result.into_iter().map(to_domain).collect())
    }

    pub fn find_one_by_id(&self, record_id: &str) -> Result<InvoiceJoin, RepositoryError> {
        Ok(invoice_dsl::invoice
            .filter(invoice_dsl::id.eq(record_id))
            .inner_join(name_dsl::name)
            .inner_join(store_dsl::store)
            .first::<InvoiceJoin>(&self.connection.connection)?)
    }
}

fn to_domain((invoice_row, name_row, store_row): InvoiceJoin) -> Invoice {
    Invoice {
        invoice_row,
        name_row,
        store_row,
    }
}

type BoxedInvoiceQuery =
    IntoBoxed<'static, InnerJoin<InnerJoin<invoice::table, name::table>, store::table>, DBType>;

fn create_filtered_query<'a>(filter: Option<InvoiceFilter>) -> BoxedInvoiceQuery {
    let mut query = invoice_dsl::invoice
        .inner_join(name_dsl::name)
        .inner_join(store_dsl::store)
        .into_boxed();

    if let Some(f) = filter {
        let InvoiceFilter {
            id,
            invoice_number,
            name_id,
            name,
            store_id,
            user_id,
            r#type,
            status,
            on_hold,
            comment,
            their_reference,
            transport_reference,
            created_datetime,
            allocated_datetime,
            picked_datetime,
            shipped_datetime,
            delivered_datetime,
            verified_datetime,
            colour,
            requisition_id,
            linked_invoice_id,
        } = f;

        apply_equal_filter!(query, id, invoice_dsl::id);
        apply_equal_filter!(query, invoice_number, invoice_dsl::invoice_number);
        apply_equal_filter!(query, name_id, invoice_dsl::name_id);
        apply_simple_string_filter!(query, name, name_dsl::name_);
        apply_equal_filter!(query, store_id, invoice_dsl::store_id);
        apply_equal_filter!(query, their_reference, invoice_dsl::their_reference);
        apply_equal_filter!(query, requisition_id, invoice_dsl::requisition_id);
        apply_simple_string_filter!(query, comment, invoice_dsl::comment);
        apply_equal_filter!(query, linked_invoice_id, invoice_dsl::linked_invoice_id);
        apply_equal_filter!(query, user_id, invoice_dsl::user_id);
        apply_equal_filter!(query, transport_reference, invoice_dsl::transport_reference);
        apply_equal_filter!(query, colour, invoice_dsl::colour);

        apply_equal_filter!(query, r#type, invoice_dsl::type_);
        apply_equal_filter!(query, status, invoice_dsl::status);

        if let Some(value) = on_hold {
            query = query.filter(invoice_dsl::on_hold.eq(value));
        }

        apply_date_time_filter!(query, created_datetime, invoice_dsl::created_datetime);
        apply_date_time_filter!(query, allocated_datetime, invoice_dsl::allocated_datetime);
        apply_date_time_filter!(query, picked_datetime, invoice_dsl::picked_datetime);
        apply_date_time_filter!(query, shipped_datetime, invoice_dsl::shipped_datetime);
        apply_date_time_filter!(query, delivered_datetime, invoice_dsl::delivered_datetime);
        apply_date_time_filter!(query, verified_datetime, invoice_dsl::verified_datetime);
    }
    query
}

impl InvoiceRowStatus {
    pub fn equal_to(&self) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.equal_to = Some(self.clone()))
    }

    pub fn not_equal_to(&self) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.not_equal_to = Some(self.clone()))
    }

    pub fn equal_any(value: Vec<Self>) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.equal_any = Some(value))
    }
}

impl InvoiceRowType {
    pub fn equal_to(&self) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.equal_to = Some(self.clone()))
    }

    pub fn not_equal_to(&self) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.not_equal_to = Some(self.clone()))
    }

    pub fn equal_any(value: Vec<Self>) -> EqualFilter<Self> {
        inline_init(|r: &mut EqualFilter<Self>| r.equal_any = Some(value))
    }
}

impl InvoiceFilter {
    pub fn new() -> InvoiceFilter {
        InvoiceFilter::default()
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn user_id(mut self, filter: EqualFilter<String>) -> Self {
        self.user_id = Some(filter);
        self
    }

    pub fn r#type(mut self, filter: EqualFilter<InvoiceRowType>) -> Self {
        self.r#type = Some(filter);
        self
    }

    pub fn invoice_number(mut self, filter: EqualFilter<i64>) -> Self {
        self.invoice_number = Some(filter);
        self
    }

    pub fn status(mut self, filter: EqualFilter<InvoiceRowStatus>) -> Self {
        self.status = Some(filter);
        self
    }

    pub fn on_hold(mut self, filter: bool) -> Self {
        self.on_hold = Some(filter);
        self
    }

    pub fn transport_reference(mut self, filter: EqualFilter<String>) -> Self {
        self.transport_reference = Some(filter);
        self
    }

    pub fn created_datetime(mut self, filter: DatetimeFilter) -> Self {
        self.created_datetime = Some(filter);
        self
    }

    pub fn allocated_datetime(mut self, filter: DatetimeFilter) -> Self {
        self.allocated_datetime = Some(filter);
        self
    }

    pub fn picked_datetime(mut self, filter: DatetimeFilter) -> Self {
        self.picked_datetime = Some(filter);
        self
    }

    pub fn shipped_datetime(mut self, filter: DatetimeFilter) -> Self {
        self.shipped_datetime = Some(filter);
        self
    }

    pub fn delivered_datetime(mut self, filter: DatetimeFilter) -> Self {
        self.delivered_datetime = Some(filter);
        self
    }

    pub fn verified_datetime(mut self, filter: DatetimeFilter) -> Self {
        self.verified_datetime = Some(filter);
        self
    }

    pub fn colour(mut self, filter: EqualFilter<String>) -> Self {
        self.colour = Some(filter);
        self
    }

    pub fn requisition_id(mut self, filter: EqualFilter<String>) -> Self {
        self.requisition_id = Some(filter);
        self
    }

    pub fn linked_invoice_id(mut self, filter: EqualFilter<String>) -> Self {
        self.linked_invoice_id = Some(filter);
        self
    }

    pub fn store_id(mut self, filter: EqualFilter<String>) -> Self {
        self.store_id = Some(filter);
        self
    }

    pub fn name_id(mut self, filter: EqualFilter<String>) -> Self {
        self.name_id = Some(filter);
        self
    }

    pub fn name(mut self, filter: SimpleStringFilter) -> Self {
        self.name = Some(filter);
        self
    }

    pub fn their_reference(mut self, filter: EqualFilter<String>) -> Self {
        self.their_reference = Some(filter);
        self
    }

    pub fn by_id(id: &str) -> InvoiceFilter {
        InvoiceFilter::new().id(EqualFilter::equal_to(id))
    }

    pub fn new_match_linked_invoice_id(id: &str) -> InvoiceFilter {
        InvoiceFilter::new().linked_invoice_id(EqualFilter::equal_to(id))
    }
}

impl InvoiceRowStatus {
    pub fn index(&self) -> u8 {
        match self {
            InvoiceRowStatus::New => 1,
            InvoiceRowStatus::Allocated => 2,
            InvoiceRowStatus::Picked => 3,
            InvoiceRowStatus::Shipped => 4,
            InvoiceRowStatus::Delivered => 5,
            InvoiceRowStatus::Verified => 6,
        }
    }
}

impl Invoice {
    pub fn other_party_name(&self) -> &str {
        &self.name_row.name
    }
    pub fn other_party_id(&self) -> &str {
        &self.invoice_row.name_id
    }
    pub fn other_party_store_id(&self) -> &Option<String> {
        &self.invoice_row.name_store_id
    }
}

#[cfg(test)]
mod tests {
    use std::cmp::Ordering;

    use super::{InvoiceRepository, InvoiceSort, InvoiceSortField};
    use crate::Pagination;
    use crate::{mock::MockDataInserts, test_db};

    #[actix_rt::test]
    async fn test_invoice_query_sort() {
        let (_, connection, _, _) =
            test_db::setup_all("test_invoice_query_sort", MockDataInserts::all()).await;
        let repo = InvoiceRepository::new(&connection);

        let mut invoices = repo.query(Pagination::new(), None, None).unwrap();

        let sorted = repo
            .query(
                Pagination::new(),
                None,
                Some(InvoiceSort {
                    key: InvoiceSortField::Comment,
                    desc: None,
                }),
            )
            .unwrap();

        invoices.sort_by(
            |a, b| match (&a.invoice_row.comment, &b.invoice_row.comment) {
                (None, None) => Ordering::Equal,
                (Some(_), None) => Ordering::Greater,
                (None, Some(_)) => Ordering::Less,
                (Some(a), Some(b)) => a.to_lowercase().cmp(&b.to_lowercase()),
            },
        );

        for (count, invoice) in invoices.iter().enumerate() {
            assert_eq!(
                invoice
                    .invoice_row
                    .comment
                    .clone()
                    .map(|comment| comment.to_lowercase()),
                sorted[count]
                    .invoice_row
                    .comment
                    .clone()
                    .map(|comment| comment.to_lowercase()),
            );
        }
    }
}
