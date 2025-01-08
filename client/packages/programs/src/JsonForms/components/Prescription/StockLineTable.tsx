import React from 'react';
import {
  ColumnAlign,
  DataTable,
  ExpiryDateCell,
  NumUtils,
  TableProvider,
  createTableStore,
  useColumns,
  useTranslation,
} from '@openmsupply-client/common';
import { DraftStockOutLine } from '@openmsupply-client/invoices/src/types';
import { UnitQuantityCell } from '@openmsupply-client/invoices/src/StockOut';

interface StockLineTableProps {
  stocklines: DraftStockOutLine[];
  handleStockLineUpdate: (lines: DraftStockOutLine[]) => void;
}

export const StockLineTable = ({
  stocklines,
  handleStockLineUpdate,
}: StockLineTableProps) => {
  const t = useTranslation();
  const handleUpdateDraft = (input: Partial<DraftStockOutLine>) => {
    const updatedDraftLines = [...stocklines];
    const lineIndex = updatedDraftLines.findIndex(line => line.id === input.id);
    if (updatedDraftLines[lineIndex]) {
      updatedDraftLines[lineIndex] = {
        ...updatedDraftLines[lineIndex],
        ...input,
      };
      handleStockLineUpdate(updatedDraftLines);
    }
  };

  const columns = useColumns<DraftStockOutLine>(
    [
      {
        width: 60,
        key: 'expiry',
        label: 'label.expiry',
        accessor: ({ rowData }) => rowData.expiryDate,
        Cell: ExpiryDateCell,
        align: ColumnAlign.Right,
      },
      {
        width: '100px',
        key: 'batch',
        label: 'label.batch',
        accessor: ({ rowData }) => rowData.stockLine?.batch,
      },
      {
        width: '90px',
        key: 'available',
        label: 'label.available-units',
        accessor: ({ rowData }) =>
          NumUtils.round(
            (rowData.stockLine?.availableNumberOfPacks ?? 0) *
              (rowData.stockLine?.packSize ?? 1),
            2
          ),
      },
      {
        width: '55px',
        key: 'unitQuantity',
        label: 'label.units-issued',
        accessor: ({ rowData }) =>
          NumUtils.round(
            (rowData.numberOfPacks ?? 0) * (rowData.packSize ?? 1),
            3
          ),
        setter: row => {
          const stockLine = { ...row } as Partial<DraftStockOutLine> & {
            id: string;
            unitQuantity: number;
          };
          // Convert input units to packs
          stockLine.numberOfPacks =
            stockLine.unitQuantity / (stockLine.packSize ?? 1);
          handleUpdateDraft(stockLine);
        },
        Cell: UnitQuantityCell,
      },
    ],
    {},
    [stocklines]
  );

  return (
    <TableProvider createStore={createTableStore}>
      <DataTable
        id="prescription-batches"
        columns={columns}
        data={stocklines ?? []}
        noDataMessage={t('messages.no-stock-available')}
        dense
      />
    </TableProvider>
  );
};
