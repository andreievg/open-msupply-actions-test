import React, { FC, useCallback } from 'react';
import {
  TableProvider,
  createTableStore,
  useEditModal,
  DetailViewSkeleton,
  AlertModal,
  useNavigate,
  RouteBuilder,
  useTranslation,
  createQueryParamsStore,
  DetailTabs,
  ModalMode,
} from '@openmsupply-client/common';
import { toItemRow, ActivityLogList } from '@openmsupply-client/system';
import { AppRoute } from '@openmsupply-client/config';
import { usePrescription } from '../api';
import { ContentArea } from './ContentArea';
import { AppBarButtons } from './AppBarButton';
import { Toolbar } from './Toolbar';
import { SidePanel } from './SidePanel';
import { Draft } from '../..';
import { Footer } from './Footer';
import { PrescriptionLineEdit } from './PrescriptionLineEdit/PrescriptionLineEdit';
import { StockOutLineFragment } from '../../StockOut';
import { StockOutItem } from '../../types';
import { HistoryModal } from './History/HistoryModal';

export const PrescriptionDetailView: FC = () => {
  const { entity, mode, onOpen, onClose, isOpen, setMode } =
    useEditModal<Draft>();
  const {
    entity: historyEntity,
    mode: historyMode,
    onOpen: onOpenHistory,
    onClose: onCloseHistory,
    isOpen: isHistoryOpen,
    setMode: setHistoryMode,
  } = useEditModal<Draft>();
  const {
    query: { data, loading },
    isDisabled,
  } = usePrescription();
  const t = useTranslation();
  const navigate = useNavigate();
  const onRowClick = useCallback(
    (item: StockOutLineFragment | StockOutItem) => {
      onOpen({ item: toItemRow(item) });
    },
    [toItemRow, onOpen]
  );
  const onAddItem = (draft?: Draft) => {
    onOpen(draft);
    setMode(ModalMode.Create);
  };
  const onViewHistory = (draft?: Draft) => {
    onOpenHistory(draft);
    setHistoryMode(ModalMode.Create);
  };

  if (loading) return <DetailViewSkeleton hasGroupBy={true} hasHold={true} />;

  const tabs = [
    {
      Component: (
        <ContentArea
          onRowClick={!isDisabled ? onRowClick : null}
          onAddItem={onAddItem}
        />
      ),
      value: 'Details',
    },
    {
      Component: <ActivityLogList recordId={data?.id ?? ''} />,
      value: 'Log',
    },
  ];

  return (
    <React.Suspense
      fallback={<DetailViewSkeleton hasGroupBy={true} hasHold={true} />}
    >
      {data ? (
        <TableProvider
          createStore={createTableStore}
          queryParamsStore={createQueryParamsStore<
            StockOutLineFragment | StockOutItem
          >({
            initialSortBy: {
              key: 'itemName',
            },
          })}
        >
          <AppBarButtons onAddItem={onAddItem} onViewHistory={onViewHistory} />
          {isOpen && (
            <PrescriptionLineEdit
              draft={entity}
              mode={mode}
              isOpen={isOpen}
              onClose={onClose}
            />
          )}
          {isHistoryOpen && (
            <HistoryModal
              draft={historyEntity}
              mode={historyMode}
              isOpen={isHistoryOpen}
              onClose={onCloseHistory}
            />
          )}
          <Toolbar />
          <DetailTabs tabs={tabs} />
          <Footer />
          <SidePanel />
        </TableProvider>
      ) : (
        <AlertModal
          open={true}
          onOk={() =>
            navigate(
              RouteBuilder.create(AppRoute.Dispensary)
                .addPart(AppRoute.Prescription)
                .build()
            )
          }
          title={t('error.prescription-not-found')}
          message={t('messages.click-to-return-to-prescriptions')}
        />
      )}
    </React.Suspense>
  );
};
