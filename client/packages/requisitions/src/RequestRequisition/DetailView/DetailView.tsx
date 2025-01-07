import React, { FC, useCallback } from 'react';
import {
  TableProvider,
  createTableStore,
  DetailViewSkeleton,
  AlertModal,
  RouteBuilder,
  useNavigate,
  useTranslation,
  useEditModal,
  createQueryParamsStore,
  DetailTabs,
  BasicModal,
  Box,
  FnUtils,
} from '@openmsupply-client/common';
import {
  ItemRowWithStatsFragment,
  ActivityLogList,
  StockItemSearchInput,
  ItemRowFragment,
} from '@openmsupply-client/system';
import { RequestLineFragment, useRequest } from '../api';
import { Toolbar } from './Toolbar';
import { Footer } from './Footer';
import { AppBarButtons } from './AppBarButtons';
import { SidePanel } from './SidePanel';
import { ContentArea } from './ContentArea';
import { AppRoute } from '@openmsupply-client/config';
import { RequestRequisitionLineErrorProvider } from '../context';
import { IndicatorsTab } from './IndicatorsTab';
import { buildIndicatorEditRoute } from './utils';

export const DetailView: FC = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useRequest.document.get();
  const isDisabled = useRequest.utils.isDisabled();
  const { mutateAsync } = useRequest.line.insert();
  const { onOpen, onClose, isOpen } = useEditModal<ItemRowWithStatsFragment>();
  const { data: programIndicators, isLoading: isProgramIndicatorsLoading } =
    useRequest.document.indicators(
      data?.otherPartyId ?? '',
      data?.period?.id ?? '',
      data?.program?.id ?? '',
      !!data
    );

  const onRowClick = useCallback((line: RequestLineFragment) => {
    navigate(
      RouteBuilder.create(AppRoute.Replenishment)
        .addPart(AppRoute.InternalOrder)
        .addPart(String(line.requisitionNumber))
        .addPart(String(line.item.id))
        .build()
    );
  }, []);

  const onProgramIndicatorClick = useCallback(
    (
      requisitionNumber?: number,
      programIndicatorCode?: string,
      indicatorId?: string
    ) => {
      if (!requisitionNumber || !programIndicatorCode || !indicatorId) return;

      navigate(
        buildIndicatorEditRoute(
          requisitionNumber,
          programIndicatorCode,
          indicatorId
        )
      );
    },
    []
  );

  if (isLoading) return <DetailViewSkeleton />;

  const tabs = [
    {
      Component: (
        <ContentArea
          onRowClick={!isDisabled ? onRowClick : null}
          onAddItem={() => onOpen(null)}
        />
      ),
      value: 'Details',
    },
    {
      Component: <ActivityLogList recordId={data?.id ?? ''} />,
      value: 'Log',
    },
  ];

  if (
    data?.programName &&
    !!data?.otherParty.store &&
    programIndicators?.totalCount !== 0
  ) {
    tabs.push({
      Component: (
        <IndicatorsTab
          onClick={onProgramIndicatorClick}
          isLoading={isLoading || isProgramIndicatorsLoading}
          request={data}
          indicators={programIndicators?.nodes}
        />
      ),
      value: t('label.indicators'),
    });
  }

  return !!data ? (
    <RequestRequisitionLineErrorProvider>
      <TableProvider
        createStore={createTableStore}
        queryParamsStore={createQueryParamsStore<RequestLineFragment>({
          initialSortBy: { key: 'itemName' },
        })}
      >
        <AppBarButtons
          isDisabled={!data || isDisabled}
          onAddItem={() => onOpen(null)}
        />
        <Toolbar />

        <DetailTabs tabs={tabs} />

        <Footer isDisabled={isDisabled} />
        <SidePanel />
        {isOpen && (
          <BasicModal open={isOpen} onClose={onClose} height={500} width={800}>
            <Box padding={2}>
              <StockItemSearchInput
                onChange={(newItem: ItemRowFragment | null) => {
                  if (newItem) {
                    mutateAsync({
                      id: FnUtils.generateUUID(),
                      requisitionId: data.id,
                      itemId: newItem.id,
                    });
                    navigate(
                      RouteBuilder.create(AppRoute.Replenishment)
                        .addPart(AppRoute.InternalOrder)
                        .addPart(String(data.requisitionNumber))
                        .addPart(String(newItem.id))
                        .build()
                    );
                  }
                }}
                openOnFocus={true}
                extraFilter={item =>
                  !data.lines.nodes.some(line => line.item.id === item.id)
                }
              />
            </Box>
          </BasicModal>
        )}
      </TableProvider>
    </RequestRequisitionLineErrorProvider>
  ) : (
    <AlertModal
      open={true}
      onOk={() =>
        navigate(
          RouteBuilder.create(AppRoute.Replenishment)
            .addPart(AppRoute.InternalOrder)
            .build()
        )
      }
      title={t('error.order-not-found')}
      message={t('messages.click-to-return-to-requisitions')}
    />
  );
};
