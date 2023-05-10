import { useEffect, useMemo } from 'react';
import { useTableStore, SortUtils } from '@openmsupply-client/common';
import { DraftOutboundLine } from '../../../../types';
import { PackSizeController } from '../hooks';
import { isA } from '../../../../utils';

export const useOutboundLineEditRows = (
  rows: DraftOutboundLine[],
  packSizeController: PackSizeController,
  scannedBatch?: string
) => {
  const tableStore = useTableStore();

  const {
    allocatableRows,
    wrongPackSizeRows,
    onHoldRows,
    noStockRows,
    placeholderRow,
    scannedBatchMismatchRows,
  } = useMemo(() => {
    const placeholderRow = rows.find(isA.placeholderLine);
    const rowsIncludeScannedBatch =
      !!scannedBatch && rows.some(row => row.stockLine?.batch === scannedBatch);

    const rowsWithoutPlaceholder = rows
      .filter(line => !isA.placeholderLine(line))
      .sort(SortUtils.byExpiryAsc);

    const isRequestedPackSize = (packSize: number) =>
      packSizeController.selected?.value === -1 ||
      packSize === packSizeController.selected?.value;

    const allocatableRows: DraftOutboundLine[] = [];
    const onHoldRows: DraftOutboundLine[] = [];
    const noStockRows: DraftOutboundLine[] = [];
    const wrongPackSizeRows: DraftOutboundLine[] = [];
    const scannedBatchMismatchRows: DraftOutboundLine[] = [];

    rowsWithoutPlaceholder.forEach(row => {
      if (!!row.stockLine?.onHold) {
        onHoldRows.push(row);
        return;
      }

      if (row.stockLine?.availableNumberOfPacks === 0) {
        noStockRows.push(row);
        return;
      }

      if (!isRequestedPackSize(row.packSize)) {
        wrongPackSizeRows.push(row);
        return;
      }

      if (rowsIncludeScannedBatch && row.stockLine?.batch !== scannedBatch) {
        scannedBatchMismatchRows.push(row);
        return;
      }

      allocatableRows.push(row);
    });

    return {
      allocatableRows,
      onHoldRows,
      noStockRows,
      wrongPackSizeRows,
      scannedBatchMismatchRows,
      placeholderRow,
    };
  }, [rows, packSizeController]);

  const orderedRows = useMemo(() => {
    return [
      ...allocatableRows,
      ...scannedBatchMismatchRows,
      ...wrongPackSizeRows,
      ...onHoldRows,
      ...noStockRows,
    ];
  }, [allocatableRows, wrongPackSizeRows, onHoldRows, noStockRows]);

  const disabledRows = useMemo(() => {
    return [
      ...wrongPackSizeRows,
      ...onHoldRows,
      ...noStockRows,
      ...scannedBatchMismatchRows,
    ];
  }, [wrongPackSizeRows, onHoldRows, noStockRows, scannedBatchMismatchRows]);

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
    placeholderRow,
    scannedBatchMismatchRows,
  };
};
