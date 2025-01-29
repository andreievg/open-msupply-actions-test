import React, { useEffect } from 'react';
import { rankWith, ControlProps, uiTypeIs } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, DetailInputWithLabelRow } from '@openmsupply-client/common';
import { DefaultFormRowSx, FORM_GAP, FORM_LABEL_WIDTH } from '../common';
import {
  PatientSearchInput,
  SearchInputPatient,
  usePatient,
} from '@openmsupply-client/system';

export const patientSearchTester = rankWith(10, uiTypeIs('PatientSearch'));

const UIComponent = (props: ControlProps) => {
  const { data, handleChange, label, path } = props;
  const [patient, setPatient] = React.useState<SearchInputPatient | null>(null);

  const onChangePatient = async (patient: SearchInputPatient) => {
    setPatient(patient);
    handleChange(path, patient.id);
  };

  const { data: patientData } = usePatient.document.get(data);

  useEffect(() => {
    if (!patientData) return;
    setPatient(patientData);
  }, [patientData]);

  if (!props.visible) {
    return null;
  }

  return (
    <DetailInputWithLabelRow
      sx={DefaultFormRowSx}
      label={label}
      labelWidthPercentage={FORM_LABEL_WIDTH}
      inputAlignment={'start'}
      Input={
        <Box display="flex" alignItems="center" gap={FORM_GAP} width="100%">
          {/* todo this */}
          {(!data || (!!patientData && patient)) && (
            <PatientSearchInput value={patient} onChange={onChangePatient} />
          )}
        </Box>
      }
    />
  );
};

export const PatientSearch = withJsonFormsControlProps(UIComponent);
