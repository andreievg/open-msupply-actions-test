#[cfg(test)]
mod query {
    use repository::mock::{
        mock_name_tag_1, mock_name_tag_2, mock_period_2_a, mock_period_2_b, mock_period_schedule_2,
        mock_store_a, MockData,
    };
    use repository::mock::{mock_program_b, MockDataInserts};
    use repository::test_db::setup_all_with_data;
    use repository::{ProgramRequisitionSettingsRow, RnRFormRow};

    use crate::service_provider::ServiceProvider;

    #[actix_rt::test]
    async fn get_schedules_with_next_periods_by_program() {
        let (_, _, connection_manager, _) = setup_all_with_data(
            "get_schedules_with_next_periods_by_program",
            MockDataInserts::all(),
            MockData {
                program_requisition_settings: vec![
                    // simulate duplicate program/period_schedule to dedup
                    ProgramRequisitionSettingsRow {
                        id: "setting_A".to_string(),
                        name_tag_id: mock_name_tag_1().id,
                        program_id: mock_program_b().id,
                        period_schedule_id: mock_period_schedule_2().id,
                    },
                    ProgramRequisitionSettingsRow {
                        id: "setting_B".to_string(),
                        // only unique by name_tag
                        name_tag_id: mock_name_tag_2().id,
                        program_id: mock_program_b().id,
                        period_schedule_id: mock_period_schedule_2().id,
                    },
                ],
                rnr_forms: vec![RnRFormRow {
                    id: "rnr_form_1".to_string(),
                    store_id: mock_store_a().id,
                    name_link_id: String::from("name_store_b"),
                    period_id: mock_period_2_a().id,
                    program_id: mock_program_b().id,
                    ..Default::default()
                }],
                ..MockData::default()
            },
        )
        .await;

        let service_provider = ServiceProvider::new(connection_manager, "app_data");
        let context = service_provider.basic_context().unwrap();
        let service = service_provider.rnr_form_service;

        let result = service
            .get_schedules_with_periods_by_program(&context, &mock_program_b().id)
            .unwrap();

        // dedupes
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].schedule_row.id, mock_period_schedule_2().id);

        let periods = &result[0].periods;
        assert_eq!(periods.len(), 2);

        // sorted in descending order, so period_2_b (FEB, newer) should be first
        assert_eq!(periods[0].period_row.id, mock_period_2_b().id);

        assert!(periods[0].rnr_form_row.is_none());
        // rnr_form_row found for correct period (period_2_a, JAN)
        assert!(periods[1].rnr_form_row.is_some());
    }
}
