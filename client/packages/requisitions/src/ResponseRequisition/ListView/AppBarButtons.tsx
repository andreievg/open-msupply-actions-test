import React from 'react';
import {
  DownloadIcon,
  useNotification,
  useTranslation,
  AppBarButtonsPortal,
  Grid,
  FileUtils,
  LoadingButton,
  EnvUtils,
  Platform,
  ToggleState,
  FnUtils,
  RouteBuilder,
  ButtonWithIcon,
  PlusCircleIcon,
  useNavigate,
} from '@openmsupply-client/common';
import { useResponse } from '../api';
import { responsesToCsv } from '../../utils';
import { AppRoute } from '@openmsupply-client/config';
import { NewRequisitionType } from '../../types';
import { CreateRequisitionModal } from './CreateRequisitionModal';

export const AppBarButtons = ({
  modalController,
}: {
  modalController: ToggleState;
}) => {
  const t = useTranslation();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const { mutateAsync: onCreate } = useResponse.document.insert();
  const { insert: onProgramCreate } = useResponse.document.insertProgram();

  const { mutateAsync, isLoading } = useResponse.document.listAll({
    key: 'createdDatetime',
    direction: 'desc',
    isDesc: true,
  });

  const csvExport = async () => {
    const data = await mutateAsync();
    if (!data || !data?.nodes.length) {
      error(t('error.no-data'))();
      return;
    }

    const csv = responsesToCsv(data.nodes, t);
    FileUtils.exportCSV(csv, 'requisitions');
    success(t('success'))();
  };

  return (
    <AppBarButtonsPortal>
      <Grid container gap={1}>
        <ButtonWithIcon
          Icon={<PlusCircleIcon />}
          label={t('button.new-requisition')}
          onClick={modalController.toggleOn}
        />
        <LoadingButton
          startIcon={<DownloadIcon />}
          isLoading={isLoading}
          onClick={csvExport}
          variant="outlined"
          disabled={EnvUtils.platform === Platform.Android}
          label={t('button.export')}
        />
      </Grid>
      <CreateRequisitionModal
        isOpen={modalController.isOn}
        onClose={modalController.toggleOff}
        onCreate={async newRequisition => {
          switch (newRequisition.type) {
            case NewRequisitionType.General:
              return onCreate({
                id: FnUtils.generateUUID(),
                otherPartyId: newRequisition.name.id,
              }).then(({ requisitionNumber }) => {
                modalController.toggleOff();
                navigate(
                  RouteBuilder.create(AppRoute.Distribution)
                    .addPart(AppRoute.CustomerRequisition)
                    .addPart(String(requisitionNumber))
                    .build()
                );
              });
            case NewRequisitionType.Program:
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { type: _, ...rest } = newRequisition;
              return await onProgramCreate({
                id: FnUtils.generateUUID(),
                ...rest,
              }).then((response) => {
                if (response.__typename == "RequisitionNode") {
                  modalController.toggleOff()
                  navigate(
                    RouteBuilder.create(AppRoute.Distribution)
                      .addPart(AppRoute.CustomerRequisition)
                      .addPart(String(response.requisitionNumber))
                      .build()
                  );
                }
              });
          }
        }}
      />
    </AppBarButtonsPortal>
  );
};
