import {
  useColumns,
  getRowExpandColumn,
  getNotePopoverColumn,
  ColumnAlign,
  GenericColumnKey,
  SortBy,
  Column,
  ArrayUtils,
  useTranslation,
  useColumnUtils,
  NumberCell,
  CurrencyCell,
  ColumnDescription,
  NumUtils,
} from '@openmsupply-client/common';
import { StockOutLineFragment } from '../../StockOut';
import { StockOutItem } from '../../types';

interface UsePrescriptionColumnOptions {
  sortBy: SortBy<StockOutLineFragment | StockOutItem>;
  onChangeSortBy: (sort: string, dir: 'desc' | 'asc') => void;
}

const expansionColumn = getRowExpandColumn<
  StockOutLineFragment | StockOutItem
>();

export const useExpansionColumns = (): Column<StockOutLineFragment>[] =>
  useColumns([
    'batch',
    'expiryDate',
    [
      'location',
      {
        accessor: ({ rowData }) => rowData.location?.code,
      },
    ],
    [
      'itemUnit',
      {
        accessor: ({ rowData }) => rowData.item?.unitName,
      },
    ],
    'numberOfPacks',
    'packSize',
    [
      'unitQuantity',
      {
        accessor: ({ rowData }) =>
          NumUtils.round(
            (rowData.numberOfPacks ?? 0) * (rowData.packSize ?? 1),
            3
          ),
      },
    ],
  ]);

export const usePrescriptionColumn = ({
  sortBy,
  onChangeSortBy,
}: UsePrescriptionColumnOptions): Column<
  StockOutLineFragment | StockOutItem
>[] => {
  const t = useTranslation();
  const { getColumnPropertyAsString, getColumnProperty } = useColumnUtils();

  const columns: ColumnDescription<StockOutLineFragment | StockOutItem>[] = [
    GenericColumnKey.Selection,
    [
      getNotePopoverColumn(t('label.directions')),
      {
        accessor: ({ rowData }) => {
          if ('lines' in rowData) {
            const { lines } = rowData;
            if (!lines) return null;

            // All the lines should have the same note, so we just take the first one
            const lineWithNote = lines.find(({ note }) => !!note);
            if (!lineWithNote) return null;

            const noteSections = [
              {
                header: null,
                body: lineWithNote.note ?? '',
              },
            ];

            return noteSections.length ? noteSections : null;
          }
          return null;
        },
      },
    ],
    [
      'itemCode',
      {
        getSortValue: row =>
          getColumnPropertyAsString<StockOutLineFragment | StockOutItem>(row, [
            { path: ['lines', 'item', 'code'] },
            { path: ['item', 'code'], default: '' },
          ]),
        accessor: ({ rowData }) =>
          getColumnProperty(rowData, [
            { path: ['lines', 'item', 'code'] },
            { path: ['item', 'code'], default: '' },
          ]),
      },
    ],
    [
      'itemName',
      {
        getSortValue: row =>
          getColumnPropertyAsString(row, [
            { path: ['lines', 'itemName'] },
            { path: ['itemName'], default: '' },
          ]),
        accessor: ({ rowData }) =>
          getColumnProperty(rowData, [
            { path: ['lines', 'itemName'] },
            { path: ['itemName'], default: '' },
          ]),
      },
    ],
    [
      'batch',
      {
        getSortValue: row =>
          getColumnPropertyAsString(row, [
            { path: ['lines', 'batch'] },
            { path: ['batch'], default: '' },
          ]),
        accessor: ({ rowData }) =>
          getColumnProperty(rowData, [
            { path: ['lines', 'batch'] },
            { path: ['batch'] },
          ]),
      },
    ],
    [
      'expiryDate',
      {
        getSortValue: row =>
          getColumnPropertyAsString(row, [
            { path: ['lines', 'expiryDate'] },
            { path: ['expiryDate'], default: '' },
          ]),
        accessor: ({ rowData }) =>
          getColumnProperty(rowData, [
            { path: ['lines', 'expiryDate'] },
            { path: ['expiryDate'] },
          ]),
      },
    ],
    [
      'location',
      {
        width: 100,
        getSortValue: row =>
          getColumnPropertyAsString(row, [
            { path: ['lines', 'location', 'code'] },
            { path: ['location', 'code'], default: '' },
          ]),
        accessor: ({ rowData }) =>
          getColumnProperty(rowData, [
            { path: ['lines', 'location', 'code'] },
            { path: ['location', 'code'] },
          ]),
      },
    ],
    [
      'itemUnit',
      {
        getSortValue: row =>
          getColumnPropertyAsString(row, [
            { path: ['lines', 'item', 'unitName'] },
            { path: ['item', 'unitName'], default: '' },
          ]),
        accessor: ({ rowData }) =>
          getColumnProperty(rowData, [
            { path: ['lines', 'item', 'unitName'] },
            { path: ['item', 'unitName'], default: '' },
          ]),
      },
    ],
    [
      'packSize',
      {
        getSortValue: row =>
          getColumnPropertyAsString(row, [
            { path: ['lines', 'packSize'] },
            { path: ['packSize'], default: '' },
          ]),
        accessor: ({ rowData }) =>
          getColumnProperty(rowData, [
            { path: ['lines', 'packSize'] },
            { path: ['packSize'] },
          ]),
      },
    ],
    [
      'unitQuantity',
      {
        accessor: ({ rowData }) => {
          if ('lines' in rowData) {
            const { lines } = rowData;
            return ArrayUtils.getUnitQuantity(lines);
          } else {
            return rowData.packSize * rowData.numberOfPacks;
          }
        },
        getSortValue: rowData => {
          if ('lines' in rowData) {
            const { lines } = rowData;
            return ArrayUtils.getUnitQuantity(lines);
          } else {
            return rowData.packSize * rowData.numberOfPacks;
          }
        },
      },
    ],

    [
      'numberOfPacks',
      {
        Cell: NumberCell,
        getSortValue: row => {
          if ('lines' in row) {
            const { lines } = row;
            const packSize = ArrayUtils.ifTheSameElseDefault(
              lines,
              'packSize',
              ''
            );
            if (packSize) {
              return lines.reduce((acc, value) => acc + value.numberOfPacks, 0);
            } else {
              return '';
            }
          } else {
            return row.numberOfPacks;
          }
        },
        accessor: ({ rowData }) => {
          if ('lines' in rowData) {
            const { lines } = rowData;
            const packSize = ArrayUtils.ifTheSameElseDefault(
              lines,
              'packSize',
              ''
            );
            if (packSize) {
              return lines.reduce((acc, value) => acc + value.numberOfPacks, 0);
            } else {
              return '';
            }
          } else {
            return rowData.numberOfPacks;
          }
        },
      },
    ],

    {
      label: 'label.cost-price',
      key: 'costPrice',
      align: ColumnAlign.Right,
      Cell: CurrencyCell,
      accessor: ({ rowData }) => {
        if ('lines' in rowData) {
          // Multiple lines, so we need to calculate the average price per unit
          let totalCostPrice = 0;
          for (const line of rowData.lines) {
            totalCostPrice += line.costPricePerPack * line.numberOfPacks;
          }
          return totalCostPrice;
        } else {
          return (rowData.costPricePerPack ?? 0) * rowData.numberOfPacks;
        }
      },
      getSortValue: rowData => {
        if ('lines' in rowData) {
          return Object.values(rowData.lines).reduce(
            (sum, batch) =>
              sum + (batch.costPricePerPack ?? 0) * batch.numberOfPacks,
            0
          );
        } else {
          return (rowData.costPricePerPack ?? 0) * rowData.numberOfPacks;
        }
      },
    },

    {
      label: 'label.sell-price',
      key: 'sellPrice',
      align: ColumnAlign.Right,
      Cell: CurrencyCell,
      accessor: ({ rowData }) => {
        if ('lines' in rowData) {
          // Multiple lines, so we need to calculate the average price per unit
          let totalSellPrice = 0;
          for (const line of rowData.lines) {
            totalSellPrice += line.sellPricePerPack * line.numberOfPacks;
          }
          return totalSellPrice;
        } else {
          return (rowData.sellPricePerPack ?? 0) * rowData.numberOfPacks;
        }
      },
      getSortValue: rowData => {
        if ('lines' in rowData) {
          return Object.values(rowData.lines).reduce(
            (sum, batch) =>
              sum + (batch.sellPricePerPack ?? 0) * batch.numberOfPacks,
            0
          );
        } else {
          return (rowData.sellPricePerPack ?? 0) * rowData.numberOfPacks;
        }
      },
    },
    expansionColumn,
  ];

  return useColumns(columns, { onChangeSortBy, sortBy }, [sortBy]);
};
