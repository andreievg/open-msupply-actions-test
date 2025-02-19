import { useEffect, useMemo } from 'react';
import { useTableStore, SortUtils } from '@openmsupply-client/common';
import { isA } from '../../../utils';
import { DraftPrescriptionLine } from '../../../types';

export const usePrescriptionLineEditRows = (
  rows: DraftPrescriptionLine[],
  isDisabled: boolean
) => {
  const tableStore = useTableStore();

  const isOnHold = (row: DraftPrescriptionLine) =>
    !!row.stockLine?.onHold || !!row.location?.onHold;
  const hasNoStock = (row: DraftPrescriptionLine) =>
    row.stockLine?.availableNumberOfPacks === 0;

  const { allocatableRows, wrongPackSizeRows, onHoldRows, noStockRows } =
    useMemo(() => {
      const rowsWithoutPlaceholder = rows
        .filter(line => !isA.placeholderLine(line))
        .sort(SortUtils.byExpiryAsc);

      const allocatableRows: DraftPrescriptionLine[] = [];
      const onHoldRows: DraftPrescriptionLine[] = [];
      const noStockRows: DraftPrescriptionLine[] = [];
      const wrongPackSizeRows: DraftPrescriptionLine[] = [];

      rowsWithoutPlaceholder.forEach(row => {
        if (isOnHold(row)) {
          onHoldRows.push(row);
          return;
        }

        if (hasNoStock(row)) {
          noStockRows.push(row);
          return;
        }

        allocatableRows.push(row);
      });

      return {
        allocatableRows,
        onHoldRows,
        noStockRows,
        wrongPackSizeRows,
      };
    }, [rows]);

  const orderedRows = useMemo(() => {
    return [
      ...allocatableRows,
      ...wrongPackSizeRows,
      ...onHoldRows,
      ...noStockRows,
    ];
  }, [allocatableRows, wrongPackSizeRows, onHoldRows, noStockRows]);

  const disabledRows = useMemo(() => {
    if (isDisabled) return orderedRows;
    return [...wrongPackSizeRows, ...onHoldRows, ...noStockRows];
  }, [wrongPackSizeRows, onHoldRows, noStockRows, isDisabled]);

  useEffect(() => {
    tableStore.setDisabledRows(disabledRows.map(({ id }) => id));
  }, [disabledRows]);

  return {
    orderedRows,
    disabledRows,
    allocatableRows,
    onHoldRows,
    noStockRows,
    wrongPackSizeRows,
  };
};
