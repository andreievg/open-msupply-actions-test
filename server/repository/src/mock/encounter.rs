use crate::EncounterRow;

use super::{mock_patient, mock_program_a};

pub fn mock_encounter_a() -> EncounterRow {
    EncounterRow {
        id: "encounter_a".to_string(),
        program_id: mock_program_a().id,
        patient_link_id: mock_patient().id,
        ..Default::default()
    }
}

pub fn mock_encounters() -> Vec<EncounterRow> {
    vec![mock_encounter_a()]
}
