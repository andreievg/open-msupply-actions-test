import React, { FC } from 'react';
import {
  AppBarButtonsPortal,
  ButtonWithIcon,
  PlusCircleIcon,
  Grid,
  useDetailPanel,
  useTranslation,
  PrinterIcon,
  LoadingButton,
  ReportContext,
} from '@openmsupply-client/common';
import {
  ReportRowFragment,
  ReportSelector,
  useReport,
} from '@openmsupply-client/system';
import { useRequest } from '../../api';
import { UseSuggestedQuantityButton } from './UseSuggestedQuantityButton';
import { AddFromMasterListButton } from './AddFromMasterListButton';

interface AppBarButtonProps {
  isDisabled: boolean;
  onAddItem: (newState: boolean) => void;
}

export const AppBarButtonsComponent: FC<AppBarButtonProps> = ({
  onAddItem,
}) => {
  const isDisabled = useRequest.utils.isDisabled();
  const isProgram = useRequest.utils.isProgram();
  const { OpenButton } = useDetailPanel();
  const t = useTranslation('distribution');
  const { data } = useRequest.document.get();
  const { print, isPrinting } = useReport.utils.print();

  const printReport = (report: ReportRowFragment) => {
    if (!data) return;
    print({ reportId: report.id, dataId: data?.id || '' });
  };

  return (
    <AppBarButtonsPortal>
      <Grid container gap={1}>
        <ButtonWithIcon
          disabled={isDisabled || isProgram}
          label={t('button.add-item')}
          Icon={<PlusCircleIcon />}
          onClick={() => onAddItem(true)}
        />

        <AddFromMasterListButton />
        <UseSuggestedQuantityButton />

        <ReportSelector
          context={ReportContext.Requisition}
          onClick={printReport}
        >
          <LoadingButton
            variant="outlined"
            startIcon={<PrinterIcon />}
            isLoading={isPrinting}
          >
            {t('button.print')}
          </LoadingButton>
        </ReportSelector>
        {OpenButton}
      </Grid>
    </AppBarButtonsPortal>
  );
};

export const AppBarButtons = React.memo(AppBarButtonsComponent);
