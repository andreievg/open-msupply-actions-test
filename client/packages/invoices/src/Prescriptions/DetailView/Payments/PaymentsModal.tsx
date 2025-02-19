import React, { FC, ReactElement, useEffect, useState } from 'react';
import {
  Autocomplete,
  BasicTextInput,
  DialogButton,
  InputWithLabelRow,
} from '@common/components';
import {
  CurrencyInput,
  Grid,
  Stack,
  usePluginEvents,
  usePluginProvider,
} from '@openmsupply-client/common';
import { useDialog } from '@common/hooks';
import { useTranslation } from '@common/intl';
import { usePrescription } from '../../api';
import { usePatient } from '@openmsupply-client/system/src';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleConfirm: () => void;
}

export const PaymentsModal: FC<PaymentsModalProps> = ({
  isOpen,
  onClose,
  handleConfirm,
}): ReactElement => {
  const t = useTranslation();
  const { Modal } = useDialog({ isOpen, onClose, disableBackdrop: true });
  const [insuranceId, setInsuranceId] = useState<string>();
  const [discountRate, setDiscountRate] = useState(0);
  const [totalToBePaidByInsurance, setTotalToBePaidByInsurance] = useState(0);

  const {
    query: { data: prescriptionData },
  } = usePrescription();

  const { plugins } = usePluginProvider();
  const pluginEvents = usePluginEvents({
    isDirty: false,
  });

  const nameId = prescriptionData?.patientId ?? '';
  const { data: insuranceData } = usePatient.document.insurances({
    nameId,
  });

  const selectedInsurance = insuranceData?.nodes.find(
    ({ insuranceProviders }) => insuranceProviders?.id === insuranceId
  );

  useEffect(() => {
    if (!prescriptionData) return;

    const totalAfterTax = prescriptionData?.pricing.totalAfterTax ?? 0;
    const discountPercentage = selectedInsurance?.discountPercentage ?? 0;

    setDiscountRate(discountPercentage);

    const discountAmount = (totalAfterTax * discountPercentage) / 100;
    setTotalToBePaidByInsurance(discountAmount);
  }, [selectedInsurance]);

  const onSave = async () => {
    // onSave logic
    if (!prescriptionData) return;

    await pluginEvents.dispatchEvent({ id: prescriptionData.id });
    handleConfirm();
    onClose();
  };

  return (
    <Modal
      width={450}
      title={t('title.payment')}
      cancelButton={<DialogButton variant="cancel" onClick={onClose} />}
      okButton={<DialogButton variant="save" onClick={onSave} />}
      sx={{
        '& .MuiDialogContent-root': { display: 'flex', alignItems: 'center' },
      }}
    >
      <>
        <Stack gap={2}>
          <InputWithLabelRow
            label={t('label.total-to-be-paid')}
            Input={
              <CurrencyInput
                value={prescriptionData?.pricing.totalAfterTax}
                onChangeNumber={() => {}}
                style={{ borderRadius: 4, pointerEvents: 'none' }}
              />
            }
          />
          <InputWithLabelRow
            label={t('label.provider-name')}
            Input={
              <Autocomplete
                options={
                  insuranceData?.nodes.map(({ insuranceProviders }) => ({
                    label: insuranceProviders?.providerName ?? '',
                    value: insuranceProviders?.id ?? '',
                  })) ?? []
                }
                getOptionLabel={option => option.label}
                value={{
                  label:
                    selectedInsurance?.insuranceProviders?.providerName ?? '',
                  value: selectedInsurance?.insuranceProviders?.id ?? '',
                }}
                onChange={(_, option) => {
                  if (option) {
                    setInsuranceId(option.value);
                  }
                }}
              />
            }
            sx={{ '& .MuiAutocomplete-root': { flexGrow: 1, borderRadius: 1 } }}
          />
          <InputWithLabelRow
            label={t('label.discount-rate')}
            Input={
              <BasicTextInput
                value={`${discountRate}%`}
                sx={{
                  pointerEvents: 'none',
                }}
              />
            }
          />
          <InputWithLabelRow
            label={t('label.total-to-be-paid-by-insurance')}
            Input={
              <CurrencyInput
                key={totalToBePaidByInsurance}
                value={totalToBePaidByInsurance}
                onChangeNumber={() => {}}
                style={{ borderRadius: 4, pointerEvents: 'none' }}
              />
            }
          />
        </Stack>
        <Grid container spacing={3} justifyContent="center">
          {plugins.prescriptionPaymentForm?.map((Plugin, index) =>
            prescriptionData ? (
              <Plugin
                key={index}
                prescriptionData={prescriptionData}
                totalToBePaidByInsurance={totalToBePaidByInsurance}
                totalToBePaidByPatient={
                  prescriptionData.pricing.totalAfterTax -
                  totalToBePaidByInsurance
                }
                events={pluginEvents}
              />
            ) : null
          )}
        </Grid>
      </>
    </Modal>
  );
};
