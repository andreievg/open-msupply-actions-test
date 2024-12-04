import React, { FC } from 'react';
import {
  AppBarContentPortal,
  Box,
  InputWithLabelRow,
  Grid,
  useTranslation,
  DropdownMenu,
  DropdownMenuItem,
  DeleteIcon,
  DateTimePickerInput,
  Formatter,
  DateUtils,
  useConfirmationModal,
  useTableStore,
  useDeleteConfirmation,
} from '@openmsupply-client/common';
import { PatientSearchInput } from '@openmsupply-client/system';
import { usePrescriptionSingle } from '../api';
import { ClinicianSearchInput } from '../../../../system/src/Clinician';
import { usePrescriptionLines } from '../api/hooks/usePrescriptionLines';

export const Toolbar: FC = () => {
  const {
    query: { data },
    update: { update },
    isDisabled,
    rows: items,
  } = usePrescriptionSingle();
  const { id, patient, clinician, prescriptionDate, createdDatetime } =
    data ?? {};

  const selectedRows =
    useTableStore(state => {
      return items
        ?.filter(({ id }) => state.rowState[id]?.isSelected)
        .map(({ lines }) => lines.flat())
        .flat();
    }) || [];

  const {
    delete: { deleteLines },
  } = usePrescriptionLines();

  const deleteAll = () => {
    const allRows = (items ?? []).map(({ lines }) => lines.flat()).flat() ?? [];
    if (allRows.length === 0) return;
    deleteLines(allRows);
  };

  const t = useTranslation();

  const confirmAndDelete = useDeleteConfirmation({
    selectedRows,
    deleteAction: () => deleteLines(selectedRows),
    canDelete: !isDisabled,
    messages: {
      confirmMessage: t('messages.confirm-delete-lines', {
        count: selectedRows.length,
      }),
      deleteSuccess: t('messages.deleted-lines', {
        count: selectedRows.length,
      }),
    },
  });

  const getConfirmation = useConfirmationModal({
    title: t('heading.are-you-sure'),
    message: t('messages.confirm-delete-prescription-lines'),
  });

  const handleDateChange = async (newPrescriptionDate: Date | null) => {
    if (!newPrescriptionDate) return;

    const oldPrescriptionDate = DateUtils.getDateOrNull(prescriptionDate);

    if (newPrescriptionDate === oldPrescriptionDate) return;

    if (!items || items.length === 0) {
      // If there are no lines, we can just update the prescription date
      await update({
        id,
        prescriptionDate: Formatter.toIsoString(
          DateUtils.endOfDayOrNull(newPrescriptionDate)
        ),
      });
      return;
    }

    // Otherwise, we need to delete all the lines first
    getConfirmation({
      onConfirm: async () => {
        await deleteAll();
        await update({
          id,
          prescriptionDate: Formatter.toIsoString(
            DateUtils.endOfDayOrNull(newPrescriptionDate)
          ),
        });
      },
    });
  };

  const defaultPrescriptionDate =
    DateUtils.getDateOrNull(prescriptionDate) ??
    DateUtils.getDateOrNull(createdDatetime) ??
    new Date();

  return (
    <AppBarContentPortal sx={{ display: 'flex', flex: 1, marginBottom: 1 }}>
      <Grid
        container
        flexDirection="row"
        display="flex"
        flex={1}
        alignItems="flex-end"
      >
        <Grid item display="flex" flex={1}>
          <Box
            display="flex"
            flex={1}
            flexDirection="column"
            gap={1}
            maxWidth={'fit-content'}
          >
            {patient && (
              <InputWithLabelRow
                label={t('label.patient')}
                Input={
                  <PatientSearchInput
                    disabled={isDisabled}
                    value={patient}
                    onChange={async ({ id: otherPartyId }) => {
                      await update({ id, otherPartyId });
                    }}
                  />
                }
              />
            )}
            <InputWithLabelRow
              label={t('label.clinician')}
              Input={
                <ClinicianSearchInput
                  onChange={async clinician => {
                    await update({
                      id,
                      clinicianId: clinician?.value?.id ?? undefined,
                    });
                  }}
                  clinicianValue={clinician}
                />
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" flex={1} marginLeft={3}>
            <InputWithLabelRow
              label={t('label.date')}
              Input={
                <DateTimePickerInput
                  disabled={isDisabled}
                  defaultValue={defaultPrescriptionDate}
                  value={DateUtils.getDateOrNull(prescriptionDate)}
                  format="P"
                  // Using onAccept rather than onChange -- on mobile, onChange
                  // is triggered when first opening the picker, which causes UI
                  // conflict with the confirmation modal
                  onAccept={handleDateChange}
                  onChange={() => {}}
                  maxDate={new Date()}
                />
              }
            />
          </Box>
        </Grid>
        <Grid
          item
          display="flex"
          gap={1}
          justifyContent="flex-end"
          alignItems="center"
        >
          <DropdownMenu label={t('label.actions')}>
            <DropdownMenuItem
              IconComponent={DeleteIcon}
              onClick={confirmAndDelete}
              disabled={isDisabled}
            >
              {t('button.delete-lines')}
            </DropdownMenuItem>
          </DropdownMenu>
        </Grid>
      </Grid>
    </AppBarContentPortal>
  );
};
