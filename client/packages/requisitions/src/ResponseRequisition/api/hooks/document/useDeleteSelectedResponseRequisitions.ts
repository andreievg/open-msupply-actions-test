import {
  useTranslation,
  useTableStore,
  RequisitionNodeStatus,
  useDeleteConfirmation,
  useUrlQueryParams,
} from '@openmsupply-client/common';
import { ResponseFragment } from '../../operations.generated';
import { useDeleteResponses } from './useDeleteResponses';
import { useResponses } from './useResponses';

export const useDeleteSelectedResponseRequisitions = () => {
  const { queryParams } = useUrlQueryParams({
    initialSort: { key: 'createdDatetime', dir: 'desc' },
  });
  const { data: rows } = useResponses(queryParams);
  const { mutateAsync } = useDeleteResponses();
  const t = useTranslation();
  const { selectedRows } = useTableStore(state => ({
    selectedRows: Object.keys(state.rowState)
      .filter(id => state.rowState[id]?.isSelected)
      .map(selectedId => rows?.nodes?.find(({ id }) => selectedId === id))
      .filter(Boolean) as ResponseFragment[],
  }));
  const deleteAction = async () => {
    await mutateAsync(selectedRows).catch(err => {
      throw err;
    });
  };

  const confirmAndDelete = useDeleteConfirmation({
    selectedRows,
    deleteAction,
    canDelete: selectedRows.every(
      ({ status }) => status !== RequisitionNodeStatus.Finalised
    ),
    messages: {
      confirmMessage: t('messages.confirm-delete-requisitions', {
        count: selectedRows.length,
      }),
      deleteSuccess: t('messages.deleted-orders', {
        count: selectedRows.length,
      }),
      cantDelete: t('messages.cant-delete-requisitions'),
    },
  });
  return confirmAndDelete;
};
