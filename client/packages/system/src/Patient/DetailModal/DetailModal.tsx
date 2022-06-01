import React, { FC, useEffect } from 'react';
import {
  useTranslation,
  useBreadcrumbs,
  DetailContainer,
  DetailInputWithLabelRow,
  DetailSection,
  Checkbox,
  Grid,
  useFormatDateTime,
  Typography,
  Box,
  BasicSpinner,
  MuiLink,
} from '@openmsupply-client/common';
import { usePatient } from '../api';
import { patient } from './demoPatient';
import schema from './json/patient_schema.json';
import Form from '@rjsf/core';

interface DetailModalProps {
  nameId: string;
}

export const DetailModal: FC<DetailModalProps> = ({ nameId }) => {
  const { data, isLoading } = usePatient.document.get(nameId);
  const t = useTranslation('common');
  const { setSuffix } = useBreadcrumbs();
  const isDisabled = true;
  const { localisedDate } = useFormatDateTime();

  const uiSchema = {
    'ui:order': ['firstName', 'lastName', '*'],
  };

  if (isLoading) return <BasicSpinner />;

  return !!data ? (
    <DetailContainer>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        maxWidth={600}
      >
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={patient}
          onChange={() => console.log('changed')}
          onSubmit={() => console.log('submitted')}
          onError={() => console.log('errors')}
        />
        {/* <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          {data.name}
        </Typography>
        <Grid container flex={1} flexDirection="row" gap={4}> */}
        {/* <DetailSection title="">
            <DetailInputWithLabelRow
              label={t('label.address')}
              inputProps={{ value: data?.address1, disabled: isDisabled }}
            />
            <DetailInputWithLabelRow
              label={t('label.code')}
              inputProps={{ value: data?.code, disabled: isDisabled }}
            />
            <DetailInputWithLabelRow
              label={t('label.chargeCode')}
              inputProps={{ value: data?.chargeCode, disabled: isDisabled }}
            />
            <DetailInputWithLabelRow
              label={t('label.country')}
              inputProps={{ value: data?.country, disabled: isDisabled }}
            />
            <DetailInputWithLabelRow
              label={t('label.comment')}
              inputProps={{ value: data?.comment, disabled: isDisabled }}
            />
            <DetailInputWithLabelRow
              label={t('label.phone')}
              inputProps={{ value: data?.phone, disabled: isDisabled }}
            />
            <DetailInputWithLabelRow
              label={t('label.website')}
              inputProps={{ value: data?.website, disabled: isDisabled }}
              DisabledInput={
                <>
                  <MuiLink
                    href={data.website ?? undefined}
                    target="_blank"
                    rel="noopener"
                  >
                    {data.website}
                  </MuiLink>
                </>
              }
            />
          </DetailSection>
          <DetailSection title="">
            <DetailInputWithLabelRow
              label={t('label.date-created')}
              inputProps={{
                value: data?.createdDatetime
                  ? localisedDate(data?.createdDatetime)
                  : '',
                disabled: isDisabled,
              }}
            />
            <DetailInputWithLabelRow
              label={t('label.manufacturer')}
              Input={
                <Checkbox
                  disabled={isDisabled}
                  checked={data?.isManufacturer}
                />
              }
            />
            <DetailInputWithLabelRow
              label={t('label.donor')}
              Input={<Checkbox disabled={isDisabled} checked={data?.isDonor} />}
            />
            <DetailInputWithLabelRow
              label={t('label.on-hold')}
              Input={
                <Checkbox disabled={isDisabled} checked={data?.isOnHold} />
              }
            />
          </DetailSection> */}
        {/* </Grid> */}
      </Box>
    </DetailContainer>
  ) : null;
};
