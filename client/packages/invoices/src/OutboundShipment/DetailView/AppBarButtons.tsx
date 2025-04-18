import React, { FC } from 'react';
import {
  AppBarButtonsPortal,
  ButtonWithIcon,
  PlusCircleIcon,
  Grid,
  useDetailPanel,
  useTranslation,
  LoadingButton,
  ReportContext,
  PrinterIcon,
} from '@openmsupply-client/common';
import { Draft, useOutbound } from '../api';
import {
  useReport,
  ReportRowFragment,
  ReportSelector,
} from '@openmsupply-client/system';
import { AddFromMasterListButton } from './AddFromMasterListButton';
import { AddFromScannerButton } from './AddFromScannerButton';

interface AppBarButtonProps {
  onAddItem: (draft?: Draft) => void;
}

export const AppBarButtonsComponent: FC<AppBarButtonProps> = ({
  onAddItem,
}) => {
  const isDisabled = useOutbound.utils.isDisabled();
  const { data } = useOutbound.document.get();
  const { OpenButton } = useDetailPanel();
  const t = useTranslation('common');
  const { print, isPrinting } = useReport.utils.print();

  const printReport = (report: ReportRowFragment) => {
    if (!data) return;
    print({ reportId: report.id, dataId: data?.id || '' });
  };

  return (
    <AppBarButtonsPortal>
      <Grid container gap={1}>
        <ButtonWithIcon
          disabled={isDisabled}
          label={t('button.add-item')}
          Icon={<PlusCircleIcon />}
          onClick={() => onAddItem()}
        />
        <AddFromMasterListButton />
        <AddFromScannerButton onAddItem={onAddItem} />
        <ReportSelector
          context={ReportContext.OutboundShipment}
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
