import React, { memo } from 'react';
import {
  Grid,
  DetailPanelSection,
  PanelField,
  PanelLabel,
  PanelRow,
  useTranslation,
  useFormatCurrency,
} from '@openmsupply-client/common';
import { useInsurance, usePrescription } from '../../api';
import { usePrescriptionGraphQL } from '../../api/usePrescriptionGraphQL';

export const PricingSectionComponent = () => {
  const t = useTranslation();
  const c = useFormatCurrency();

  const prescriptionData = usePrescription().query.data;
  const pricing = prescriptionData?.pricing;
  if (!pricing) return null;

  const insuranceId = prescriptionData?.nameInsuranceJoinId;
  const { storeId } = usePrescriptionGraphQL();

  console.log('insurance Id: ', insuranceId)
  
  const insuranceData = insuranceId ? useInsurance(insuranceId, storeId).query.data : null;

  console.log("Insurance Data: ", insuranceData)

  return (
    <DetailPanelSection title={t('heading.pricing')}>
      <Grid container gap={0.5}>
        
        {insuranceData && insuranceData.isActive && insuranceData.insuranceProviders?.isActive && (
        <>
        <PanelRow>
          <PanelLabel>{t('label.insurance-provider-name')}</PanelLabel>
          <PanelField>
            {insuranceData.insuranceProviders?.providerName}
          </PanelField>
        </PanelRow>

        <PanelRow>
          <PanelLabel>{t('label.percent-discount')}</PanelLabel>
          <PanelField>{insuranceData.discountPercentage}% </PanelField>
        </PanelRow>
        </>
        )}

        <PanelRow>
          <PanelLabel fontWeight="bold">{t('heading.grand-total')}</PanelLabel>
          <PanelField>{c(pricing.totalAfterTax)}</PanelField>
        </PanelRow>
      </Grid>
    </DetailPanelSection>
  );
};

export const PricingSection = memo(PricingSectionComponent);
