import {
  RecordPatch,
  ArrayUtils,
  useTranslation,
  noOtherVariants,
  getErrorMessage,
} from '@openmsupply-client/common';
import { ItemRowFragment } from '@openmsupply-client/system';
import { StocktakeLineFragment, useStocktake } from './../../../../api';
import { DraftStocktakeLine, DraftLine } from '../utils';
import { useNextItem } from './useNextItem';
import { useDraftStocktakeLines } from './useDraftStocktakeLines';
import { useStocktakeLineErrorContext } from 'packages/inventory/src/Stocktake/context';

interface useStocktakeLineEditController {
  draftLines: DraftStocktakeLine[];
  update: (patch: RecordPatch<StocktakeLineFragment>) => void;
  addLine: () => void;
  save: () => Promise<{ errorMessages?: string[] }>;
  isLoading: boolean;
  nextItem: ItemRowFragment | null;
}

export const useStocktakeLineEdit = (
  item: ItemRowFragment | null
): useStocktakeLineEditController => {
  const t = useTranslation('inventory');
  const { id } = useStocktake.document.fields('id');
  const nextItem = useNextItem(item?.id);
  const [draftLines, setDraftLines] = useDraftStocktakeLines(item);
  const { mutateAsync: upsertLines, isLoading } = useStocktake.line.save();
  const errorsContext = useStocktakeLineErrorContext();

  const update = (patch: RecordPatch<DraftStocktakeLine>) =>
    setDraftLines(lines =>
      ArrayUtils.immutablePatch(lines, {
        ...patch,
        isUpdated: !patch.isCreated,
      })
    );

  const mapStructuredErrors = (
    result: Awaited<ReturnType<typeof upsertLines>>
  ) => {
    const insertResults = result.batchStocktake?.insertStocktakeLines || [];
    const updateResults = result.batchStocktake?.updateStocktakeLines || [];

    const errorMessagesMap: { [key: string]: string } = {};

    for (const { response, id } of [...insertResults, ...updateResults]) {
      // First unset error
      errorsContext.unsetError(id);
      // No error
      if (response.__typename === 'StocktakeLineNode') continue;

      const { error } = response;
      // Common error for all lines
      if (error.__typename === 'CannotEditStocktake') {
        errorMessagesMap[error.__typename] = t('error.not-editable');
        continue;
      }
      // Line specific errors
      switch (error.__typename) {
        case 'AdjustmentReasonNotProvided':
          errorMessagesMap[error.__typename] = t('error.provide-reason');
          break;
        case 'AdjustmentReasonNotValid':
          errorMessagesMap[error.__typename] = t('error.provide-valid-reason');
          break;
        case 'StockLineReducedBelowZero':
          errorMessagesMap[error.__typename] = t(
            'error.stocktake-has-stock-reduced-below-zero'
          );
          break;

        default:
          noOtherVariants(error);
      }

      errorsContext.setError(id, error);
    }

    const errorMessages = Object.values(errorMessagesMap);
    return {
      errorMessages: errorMessages.length === 0 ? undefined : errorMessages,
    };
  };

  const save = async () => {
    let result;
    try {
      result = await upsertLines(draftLines);

      return mapStructuredErrors(result);
    } catch (e) {
      return { errorMessages: [getErrorMessage(e)] };
    }
  };

  const addLine = () => {
    if (item) {
      setDraftLines(lines => [...lines, DraftLine.fromItem(id, item)]);
    }
  };

  return {
    draftLines,
    update,
    addLine,
    save,
    isLoading,
    nextItem,
  };
};
