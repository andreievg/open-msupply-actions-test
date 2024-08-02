import React, { FC, useEffect } from 'react';
import {
  useDialog,
  Grid,
  DialogButton,
  useTranslation,
  useNavigate,
  RouteBuilder,
  Autocomplete,
  InputWithLabelRow,
  SchedulePeriodNode,
  RnRFormNodeStatus,
  Typography,
} from '@openmsupply-client/common';
import { AppRoute } from '@openmsupply-client/config';
import { SupplierSearchInput } from '@openmsupply-client/system';
import { ProgramSearchInput } from './ProgramSearchInput';
import { useCreateRnRForm, useSchedulesAndPeriods } from '../../api';

interface RnRFormCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RnRFormCreateModal: FC<RnRFormCreateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { Modal } = useDialog({ isOpen, onClose });
  const t = useTranslation('programs');
  const navigate = useNavigate();

  const { previousForm, draft, updateDraft, clearDraft, create, isIncomplete } =
    useCreateRnRForm();

  const { data: schedulesAndPeriods } = useSchedulesAndPeriods(
    draft.program?.id ?? ''
  );

  // If there is only one schedule (and no other has been selected) set it automatically
  useEffect(() => {
    if (schedulesAndPeriods?.nodes.length == 1 && !draft.schedule) {
      updateDraft({ schedule: schedulesAndPeriods.nodes[0]! }); // if length is 1, the first element must exist
    }
    // Rerun if schedules change (i.e. when program changes)
  }, [schedulesAndPeriods?.nodes]);

  const width = '350px';
  const prevFormNotFinalised =
    !!previousForm && previousForm.status !== RnRFormNodeStatus.Finalised;

  return (
    <Modal
      okButton={
        <DialogButton
          variant="ok"
          disabled={isIncomplete || prevFormNotFinalised}
          onClick={async () => {
            try {
              const result = await create();
              if (result)
                navigate(
                  RouteBuilder.create(AppRoute.Programs)
                    .addPart(AppRoute.RnRForms)
                    .addPart(result.id)
                    .build()
                );
            } catch (e) {
              console.error(e);
            }
          }}
        />
      }
      cancelButton={
        <DialogButton
          variant="cancel"
          onClick={() => {
            clearDraft();
            onClose();
          }}
        />
      }
      title={t('label.new-rnr-form')}
    >
      <Grid flexDirection="column" display="flex" gap={2}>
        <InputWithLabelRow
          label={t('label.program')}
          Input={
            <ProgramSearchInput
              width={width}
              onChange={program =>
                updateDraft({
                  program,
                  schedule: null,
                  period: null,
                })
              }
              value={draft.program}
            />
          }
        />
        <InputWithLabelRow
          label={t('label.schedule')}
          Input={
            <Autocomplete
              width={width}
              disabled={!draft.program}
              optionKey="name"
              options={schedulesAndPeriods?.nodes ?? []}
              value={draft.schedule}
              onChange={(_, schedule) =>
                schedule && updateDraft({ schedule, period: null })
              }
              clearable={false}
            />
          }
        />
        <InputWithLabelRow
          label={t('label.period')}
          Input={
            <PeriodSelect
              width={width}
              disabled={!draft.program}
              options={draft.schedule?.periods ?? []}
              value={draft.period}
              onChange={period => updateDraft({ period })}
              mostRecentUsedPeriodId={previousForm?.periodId}
            />
          }
        />
        {/* TOOD: no more periods.. */}
        {prevFormNotFinalised && (
          <Typography
            sx={{
              fontStyle: 'italic',
              color: 'gray.dark',
              fontSize: 'small',
              width: '450px',
            }}
          >
            {t('messages.finalise-previous-form')}
          </Typography>
        )}

        <InputWithLabelRow
          label={t('label.supplier')}
          Input={
            <SupplierSearchInput
              width={350}
              onChange={supplier => updateDraft({ supplier })}
              value={draft.supplier}
            />
          }
        />
      </Grid>
    </Modal>
  );
};

const PeriodSelect = ({
  width,
  disabled,
  options,
  value,
  mostRecentUsedPeriodId,
  onChange,
}: {
  width: string;
  disabled: boolean;
  options: SchedulePeriodNode[];
  value: SchedulePeriodNode | null;
  mostRecentUsedPeriodId?: string;
  onChange: (period: SchedulePeriodNode) => void;
}) => {
  const mostRecentUsedPeriodIdx = options.findIndex(
    period => period.id === mostRecentUsedPeriodId
  );

  // NOTE! This assumes periods are in order, newest ones at the top
  const nextPeriod = options[mostRecentUsedPeriodIdx - 1];

  if (mostRecentUsedPeriodId && !nextPeriod) {
    // TODO: show no avialable periods..
    console.log('hello');
  }

  useEffect(() => {
    if (nextPeriod && value !== nextPeriod) onChange(nextPeriod);
  }, [nextPeriod]);

  return (
    <Autocomplete
      width={width}
      disabled={disabled}
      getOptionDisabled={option =>
        !!mostRecentUsedPeriodId && option.id !== nextPeriod?.id
      }
      getOptionLabel={option => option.period.name}
      options={options}
      value={value}
      onChange={(_, period) => period && onChange(period)}
      clearable={false}
    />
  );
};
