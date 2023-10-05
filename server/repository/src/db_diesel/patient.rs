use super::{
    name_row::{name, name::dsl as name_dsl},
    program_enrolment_row::program_enrolment::dsl as program_enrolment_dsl,
    DBType, NameRow, StorageConnection,
};

use crate::{
    db_diesel::program_enrolment,
    diesel_extensions::date_coalesce,
    diesel_macros::{
        apply_date_filter, apply_equal_filter, apply_sort_no_case, apply_string_filter,
        apply_string_or_filter,
    },
    repository_error::RepositoryError,
    DateFilter, EqualFilter, Gender, NameType, Pagination, ProgramEnrolmentFilter, Sort,
    StringFilter,
};

use chrono::NaiveDate;
use diesel::{dsl::IntoBoxed, prelude::*};

pub type Patient = NameRow;

#[derive(Clone, Default, PartialEq, Debug)]
pub struct PatientFilter {
    pub id: Option<EqualFilter<String>>,
    pub name: Option<StringFilter>,
    pub code: Option<StringFilter>,
    pub code_2: Option<StringFilter>,
    pub first_name: Option<StringFilter>,
    pub last_name: Option<StringFilter>,
    pub gender: Option<EqualFilter<Gender>>,
    pub date_of_birth: Option<DateFilter>,
    pub date_of_death: Option<DateFilter>,
    pub phone: Option<StringFilter>,
    pub address1: Option<StringFilter>,
    pub address2: Option<StringFilter>,
    pub country: Option<StringFilter>,
    pub email: Option<StringFilter>,

    /// Filter for any identifier associated with a name entry.
    /// Currently:
    /// - name::code
    /// - name::national_health_number
    /// - program_enrolment::program_enrolment_id
    pub identifier: Option<StringFilter>,
    // Filter for name and code
    pub name_or_code: Option<StringFilter>,
}

#[derive(PartialEq, Debug)]
pub enum PatientSortField {
    Name,
    Code,
    Code2,
    FirstName,
    LastName,
    Gender,
    DateOfBirth,
    Phone,
    Address1,
    Address2,
    Country,
    Email,
    DateOfDeath,
}

pub type PatientSort = Sort<PatientSortField>;

pub struct PatientRepository<'a> {
    connection: &'a StorageConnection,
}

impl<'a> PatientRepository<'a> {
    pub fn new(connection: &'a StorageConnection) -> Self {
        PatientRepository { connection }
    }

    pub fn count(
        &self,
        filter: Option<PatientFilter>,
        allowed_ctx: Option<&[String]>,
    ) -> Result<i64, RepositoryError> {
        let query = Self::create_filtered_query(filter, allowed_ctx);

        Ok(query.count().get_result(&self.connection.connection)?)
    }

    pub fn query_by_filter(
        &self,
        filter: PatientFilter,
        allowed_ctx: Option<&[String]>,
    ) -> Result<Vec<Patient>, RepositoryError> {
        self.query(Pagination::new(), Some(filter), None, allowed_ctx)
    }

    pub fn query_one(
        &self,
        filter: PatientFilter,
        allowed_ctx: Option<&[String]>,
    ) -> Result<Option<Patient>, RepositoryError> {
        Ok(self.query_by_filter(filter, allowed_ctx)?.pop())
    }

    pub fn query(
        &self,
        pagination: Pagination,
        filter: Option<PatientFilter>,
        sort: Option<PatientSort>,
        allowed_ctx: Option<&[String]>,
    ) -> Result<Vec<Patient>, RepositoryError> {
        let mut query = Self::create_filtered_query(filter, allowed_ctx);

        if let Some(sort) = sort {
            match sort.key {
                PatientSortField::Name => {
                    apply_sort_no_case!(query, sort, name_dsl::name_);
                }
                PatientSortField::Code => {
                    apply_sort_no_case!(query, sort, name_dsl::code);
                }
                PatientSortField::FirstName => {
                    apply_sort_no_case!(query, sort, name_dsl::first_name)
                }
                PatientSortField::LastName => apply_sort_no_case!(query, sort, name_dsl::last_name),
                PatientSortField::Gender => apply_sort_no_case!(query, sort, name_dsl::gender),
                PatientSortField::DateOfBirth => {
                    apply_sort_no_case!(query, sort, name_dsl::date_of_birth)
                }
                PatientSortField::Phone => apply_sort_no_case!(query, sort, name_dsl::phone),
                PatientSortField::Address1 => apply_sort_no_case!(query, sort, name_dsl::address1),
                PatientSortField::Address2 => apply_sort_no_case!(query, sort, name_dsl::address2),
                PatientSortField::Country => apply_sort_no_case!(query, sort, name_dsl::country),
                PatientSortField::Email => apply_sort_no_case!(query, sort, name_dsl::email),
                PatientSortField::Code2 => {
                    apply_sort_no_case!(query, sort, name_dsl::national_health_number)
                }
                PatientSortField::DateOfDeath => {
                    apply_sort_no_case!(query, sort, name_dsl::date_of_death)
                }
            }
        } else {
            query = query.order(name_dsl::id.asc())
        }

        let final_query = query
            .offset(pagination.offset as i64)
            .limit(pagination.limit as i64);

        // Debug diesel query
        // println!(
        //     "{}",
        //     diesel::debug_query::<DBType, _>(&final_query).to_string()
        // );

        let result = final_query.load::<NameRow>(&self.connection.connection)?;

        Ok(result)
    }

    /// Returns a list of names left joined to name_store_join (for name_store_joins matching store_id parameter)
    /// Names will still be present in result even if name_store_join doesn't match store_id in parameters
    /// but it's considered invisible in subseqent filters.
    pub fn create_filtered_query(
        filter: Option<PatientFilter>,
        allowed_ctx: Option<&[String]>,
    ) -> BoxedNameQuery {
        let mut query = name_dsl::name.into_boxed();

        if let Some(f) = filter {
            let PatientFilter {
                id,
                name,
                code,
                code_2: national_health_number,
                first_name,
                last_name,
                gender,
                date_of_birth,
                date_of_death,
                phone,
                address1,
                address2,
                country,
                email,
                identifier,
                name_or_code,
            } = f;

            // or filters need to be applied first
            if identifier.is_some() {
                apply_string_filter!(query, identifier.clone(), name_dsl::code);
                apply_string_or_filter!(
                    query,
                    identifier.clone(),
                    name_dsl::national_health_number
                );

                let sub_query =
                    program_enrolment::create_filtered_query(Some(ProgramEnrolmentFilter {
                        program_enrolment_id: identifier,
                        program_context_id: allowed_ctx
                            .map(|ctxs| EqualFilter::default().restrict_results(ctxs)),
                        ..Default::default()
                    }))
                    .select(program_enrolment_dsl::patient_id);

                query = query.or_filter(name_dsl::id.eq_any(sub_query))
            }

            if name_or_code.is_some() {
                apply_string_filter!(query, name_or_code.clone(), name_dsl::name_);
                apply_string_or_filter!(query, name_or_code.clone(), name_dsl::code);
            }

            apply_equal_filter!(query, id, name_dsl::id);
            apply_string_filter!(query, code, name_dsl::code);
            apply_string_filter!(
                query,
                national_health_number,
                name_dsl::national_health_number
            );
            apply_string_filter!(query, name, name_dsl::name_);

            apply_string_filter!(query, first_name, name_dsl::first_name);
            apply_string_filter!(query, last_name, name_dsl::last_name);
            apply_equal_filter!(query, gender, name_dsl::gender);
            apply_date_filter!(query, date_of_birth, name_dsl::date_of_birth);
            apply_date_filter!(
                query,
                date_of_death,
                date_coalesce::coalesce(
                    name_dsl::date_of_death,
                    NaiveDate::from_ymd_opt(9999, 12, 31).unwrap()
                )
            );
            apply_string_filter!(query, phone, name_dsl::phone);
            apply_string_filter!(query, address1, name_dsl::address1);
            apply_string_filter!(query, address2, name_dsl::address2);
            apply_string_filter!(query, country, name_dsl::country);
            apply_string_filter!(query, email, name_dsl::email);
        };

        apply_equal_filter!(
            query,
            Some(NameType::equal_to(&NameType::Patient)),
            name_dsl::type_
        );
        query
    }
}

type BoxedNameQuery = IntoBoxed<'static, name::table, DBType>;

impl PatientFilter {
    pub fn new() -> PatientFilter {
        PatientFilter::default()
    }

    pub fn id(mut self, filter: EqualFilter<String>) -> Self {
        self.id = Some(filter);
        self
    }

    pub fn name(mut self, filter: StringFilter) -> Self {
        self.name = Some(filter);
        self
    }

    pub fn code(mut self, filter: StringFilter) -> Self {
        self.code = Some(filter);
        self
    }

    pub fn code_2(mut self, filter: StringFilter) -> Self {
        self.code_2 = Some(filter);
        self
    }

    pub fn identifier(mut self, filter: StringFilter) -> Self {
        self.identifier = Some(filter);
        self
    }

    pub fn first_name(mut self, filter: StringFilter) -> Self {
        self.first_name = Some(filter);
        self
    }

    pub fn last_name(mut self, filter: StringFilter) -> Self {
        self.last_name = Some(filter);
        self
    }

    pub fn gender(mut self, filter: EqualFilter<Gender>) -> Self {
        self.gender = Some(filter);
        self
    }

    pub fn date_of_birth(mut self, filter: DateFilter) -> Self {
        self.date_of_birth = Some(filter);
        self
    }

    pub fn date_of_death(mut self, filter: DateFilter) -> Self {
        self.date_of_death = Some(filter);
        self
    }

    pub fn phone(mut self, filter: StringFilter) -> Self {
        self.phone = Some(filter);
        self
    }

    pub fn address1(mut self, filter: StringFilter) -> Self {
        self.address1 = Some(filter);
        self
    }
    pub fn address2(mut self, filter: StringFilter) -> Self {
        self.address2 = Some(filter);
        self
    }
    pub fn country(mut self, filter: StringFilter) -> Self {
        self.country = Some(filter);
        self
    }

    pub fn email(mut self, filter: StringFilter) -> Self {
        self.email = Some(filter);
        self
    }

    pub fn name_or_code(mut self, filter: StringFilter) -> Self {
        self.name_or_code = Some(filter);
        self
    }
}

#[cfg(test)]
mod tests {
    use chrono::{NaiveDate, Utc};
    use util::inline_init;

    use crate::{
        mock::{mock_program_a, MockDataInserts},
        test_db, DateFilter, EqualFilter, NameRow, NameRowRepository, NameType, PatientFilter,
        PatientRepository, ProgramEnrolmentRow, ProgramEnrolmentRowRepository,
        ProgramEnrolmentStatus, StringFilter,
    };

    #[actix_rt::test]
    async fn test_patient_query() {
        let (_, connection, _, _) = test_db::setup_all(
            "patient_query",
            MockDataInserts::none().names().stores().name_store_joins(),
        )
        .await;
        let repo = PatientRepository::new(&connection);
        // Make sure we don't return names that are not patients
        let result = repo
            .query_by_filter(
                PatientFilter::new().identifier(StringFilter::equal_to("code2")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0), None);

        let name_row_repo = NameRowRepository::new(&connection);
        let patient_row = inline_init(|row: &mut NameRow| {
            row.id = "patient_1".to_string();
            row.r#type = NameType::Patient;
            row.code = "codePatient".to_string();
            row.national_health_number = Some("nhnPatient".to_string());
        });
        name_row_repo.upsert_one(&patient_row).unwrap();

        let result = repo
            .query_by_filter(
                PatientFilter::new().id(EqualFilter::equal_to("patient_1")),
                None,
            )
            .unwrap();
        result.get(0).unwrap();
    }

    #[actix_rt::test]
    async fn test_patient_identifier_query() {
        let (_, connection, _, _) = test_db::setup_all(
            "patient_identifier_query",
            MockDataInserts::none()
                .units()
                .items()
                .names()
                .stores()
                .name_store_joins()
                .full_master_list()
                .contexts()
                .programs(),
        )
        .await;
        let repo = PatientRepository::new(&connection);

        // add name and name_store_join
        let name_row_repo = NameRowRepository::new(&connection);
        let patient_row = inline_init(|row: &mut NameRow| {
            row.id = "patient_1".to_string();
            row.r#type = NameType::Patient;
            row.code = "codePatient".to_string();
            row.national_health_number = Some("nhnPatient".to_string());
        });
        name_row_repo.upsert_one(&patient_row).unwrap();

        // Test identifier search
        ProgramEnrolmentRowRepository::new(&connection)
            .upsert_one(&ProgramEnrolmentRow {
                id: util::uuid::uuid(),
                document_name: "doc_name".to_string(),
                patient_id: patient_row.id.clone(),
                document_type: "ProgramType".to_string(),
                program_id: mock_program_a().id,
                enrolment_datetime: Utc::now().naive_utc(),
                program_enrolment_id: Some("program_enrolment_id".to_string()),
                status: ProgramEnrolmentStatus::Active,
            })
            .unwrap();
        let result = repo
            .query_by_filter(
                PatientFilter::new().identifier(StringFilter::equal_to("codePatient")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().id, patient_row.id);
        let result = repo
            .query_by_filter(
                PatientFilter::new().identifier(StringFilter::equal_to("nhnPatient")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().id, patient_row.id);
        let result = repo
            .query_by_filter(
                PatientFilter::new().identifier(StringFilter::equal_to("program_enrolment_id")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().id, patient_row.id);
        let result = repo
            .query_by_filter(
                PatientFilter::new()
                    .code(StringFilter::equal_to("codePatient"))
                    .identifier(StringFilter::equal_to("program_enrolment_id")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().id, patient_row.id);
        // no result when having an `AND code is "does not exist"` clause
        let result = repo
            .query_by_filter(
                PatientFilter::new()
                    .code(StringFilter::equal_to("code does not exist"))
                    .identifier(StringFilter::equal_to("program_enrolment_id")),
                None,
            )
            .unwrap();
        assert_eq!(result.len(), 0);
        let result = repo
            .query_by_filter(
                PatientFilter::new()
                    .identifier(StringFilter::equal_to("identifier does not exist")),
                None,
            )
            .unwrap();
        assert_eq!(result.len(), 0);
        // test filter for name_or_code and identifier
        let result = repo
            .query_by_filter(
                PatientFilter::new()
                    .name_or_code(StringFilter::equal_to("codePatient"))
                    .identifier(StringFilter::like("nhn")),
                None,
            )
            .unwrap();
        assert_eq!(result.get(0).unwrap().id, patient_row.id);
    }

    #[actix_rt::test]
    async fn test_patient_program_enrolment_id_allowed_ctx() {
        let (_, connection, _, _) = test_db::setup_all(
            "test_patient_program_enrolment_id_allowed_ctx",
            MockDataInserts::none()
                .units()
                .items()
                .names()
                .stores()
                .name_store_joins()
                .full_master_list()
                .contexts()
                .programs(),
        )
        .await;
        let repo = PatientRepository::new(&connection);

        // add name and name_store_join
        let name_row_repo = NameRowRepository::new(&connection);
        let patient_row = inline_init(|row: &mut NameRow| {
            row.id = "patient_1".to_string();
            row.r#type = NameType::Patient;
            row.code = "codePatient".to_string();
            row.national_health_number = Some("nhnPatient".to_string());
        });
        name_row_repo.upsert_one(&patient_row).unwrap();

        // Searching by program enrolment id requires correct context access
        ProgramEnrolmentRowRepository::new(&connection)
            .upsert_one(&ProgramEnrolmentRow {
                id: util::uuid::uuid(),
                document_name: "doc_name".to_string(),
                patient_id: patient_row.id.clone(),
                document_type: "ProgramType".to_string(),
                program_id: mock_program_a().id,
                enrolment_datetime: Utc::now().naive_utc(),
                program_enrolment_id: Some("program_enrolment_id".to_string()),
                status: ProgramEnrolmentStatus::Active,
            })
            .unwrap();
        let result = repo
            .query_by_filter(
                PatientFilter::new().identifier(StringFilter::equal_to("program_enrolment_id")),
                Some(&["WrongContext".to_string()]),
            )
            .unwrap();
        assert!(result.is_empty());
        let result = repo
            .query_by_filter(
                PatientFilter::new().identifier(StringFilter::equal_to("program_enrolment_id")),
                Some(&[mock_program_a().id]),
            )
            .unwrap();
        assert!(!result.is_empty());
    }

    #[actix_rt::test]
    async fn test_name_date_of_death() {
        let (_, connection, _, _) =
            test_db::setup_all("test_name_date_of_death", MockDataInserts::none()).await;
        let repo = PatientRepository::new(&connection);

        let name_row_repo = NameRowRepository::new(&connection);
        let patient_row = inline_init(|row: &mut NameRow| {
            row.id = "patient_1".to_string();
            row.r#type = NameType::Patient;
        });
        name_row_repo.upsert_one(&patient_row).unwrap();

        // Query if patient is still alive if date of death is not set
        let result = repo
            .query_by_filter(
                PatientFilter::new().date_of_death(DateFilter::after_or_equal_to(
                    NaiveDate::from_ymd_opt(2023, 05, 20).unwrap(),
                )),
                None,
            )
            .unwrap();
        assert_eq!(result.len(), 1);

        // Add date of death
        let patient_row = inline_init(|row: &mut NameRow| {
            row.id = "patient_1".to_string();
            row.r#type = NameType::Patient;
            row.date_of_death = Some(NaiveDate::from_ymd_opt(2023, 09, 20).unwrap())
        });
        name_row_repo.upsert_one(&patient_row).unwrap();
        // Query if patient is not alive after date_of_death
        let result = repo
            .query_by_filter(
                PatientFilter::new().date_of_death(DateFilter::after_or_equal_to(
                    NaiveDate::from_ymd_opt(2023, 09, 22).unwrap(),
                )),
                None,
            )
            .unwrap();
        assert_eq!(result.len(), 0);
        // Query if patient is still alive before date_of_death
        let result = repo
            .query_by_filter(
                PatientFilter::new().date_of_death(DateFilter::after_or_equal_to(
                    NaiveDate::from_ymd_opt(2023, 05, 20).unwrap(),
                )),
                None,
            )
            .unwrap();
        assert_eq!(result.len(), 1);
    }
}
