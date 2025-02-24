import {
  useDeleteConfirmation,
  useMutation,
  useQueryClient,
  useTableStore,
  useTranslation,
} from '@openmsupply-client/common';
import { useAssetApi } from '../utils/useAssetApi';
import { useAssets } from './useAssets';
import { AssetCatalogueItemFragment } from '../../operations.generated';

export const useAssetsDelete = () => {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const api = useAssetApi();
  const { data: rows } = useAssets();
  const { mutateAsync } = useMutation(async (id: string) => api.delete(id));

  const { selectedRows } = useTableStore(state => ({
    selectedRows: Object.keys(state.rowState)
      .filter(id => state.rowState[id]?.isSelected)
      .map(selectedId => rows?.nodes?.find(({ id }) => selectedId === id))
      .filter(Boolean) as AssetCatalogueItemFragment[],
  }));
  const { clearSelected } = useTableStore();

  const deleteAction = async () => {
    await Promise.all(selectedRows.map(row => mutateAsync(row.id)))
      .then(() => {
        queryClient.invalidateQueries(api.keys.base());
        clearSelected();
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  };

  const confirmAndDelete = useDeleteConfirmation({
    selectedRows,
    deleteAction,
    messages: {
      confirmMessage: t('messages.confirm-delete-assets', {
        count: selectedRows.length,
      }),
      deleteSuccess: t('messages.deleted-assets', {
        count: selectedRows.length,
      }),
    },
  });

  return { confirmAndDelete, selectedRows };
};
