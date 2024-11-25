import React, { FC, useState } from 'react';
import {
  ColumnDescription,
  DataTable,
  DotCell,
  Grid,
  NothingHere,
  Pagination,
  SearchBar,
  TooltipTextCell,
  useColumns,
  useIsCentralServerApi,
  useTranslation,
} from '@openmsupply-client/common';
import { ImportRow } from './EquipmentImportModal';
import { Status } from '../Components';

interface ImportReviewDataTableProps {
  importRows: ImportRow[];
  showWarnings: boolean;
}
export const ImportReviewDataTable: FC<ImportReviewDataTableProps> = ({
  importRows,
  showWarnings,
}) => {
  const t = useTranslation();
  const isCentralServer = useIsCentralServerApi();
  const [pagination, setPagination] = useState<Pagination>({
    page: 0,
    first: 20,
    offset: 0,
  });
  const [searchString, setSearchString] = useState<string>(() => '');
  const columnDescriptions: ColumnDescription<ImportRow>[] = [];

  if (isCentralServer) {
    columnDescriptions.push({
      key: 'store',
      width: 80,
      sortable: false,
      label: 'label.store',
      accessor: ({ rowData }) => rowData.store?.code,
    });
  }

  columnDescriptions.push(
    {
      key: 'assetNumber',
      width: 90,
      sortable: false,
      label: 'label.asset-number',
    },
    {
      key: 'catalogueItemCode',
      sortable: false,
      label: 'label.catalogue-item-code',
    },
    {
      key: 'installationDate',
      sortable: false,
      label: 'label.installation-date',
      Cell: TooltipTextCell,
    },
    {
      key: 'replacementDate',
      sortable: false,
      label: 'label.replacement-date',
      Cell: TooltipTextCell,
    },
    {
      key: 'warrantyStart',
      sortable: false,
      label: 'label.warranty-start-date',
      Cell: TooltipTextCell,
    },
    {
      key: 'warrantyEnd',
      sortable: false,
      label: 'label.warranty-end-date',
      Cell: TooltipTextCell,
    },
    {
      key: 'serialNumber',
      sortable: false,
      label: 'label.serial',
      Cell: TooltipTextCell,
    },
    {
      key: 'status',
      sortable: false,
      label: 'label.status',
      Cell: ({ rowData }) => <Status status={rowData.status} />,
    },
    {
      key: 'needsReplacement',
      sortable: false,
      label: 'label.needs-replacement',
      Cell: DotCell,
      accessor: ({ rowData }) => !!rowData.needsReplacement,
    },
    {
      key: 'notes',
      width: 100,
      sortable: false,
      label: 'label.asset-notes',
      Cell: TooltipTextCell,
    }
  );

  if (showWarnings) {
    columnDescriptions.push({
      key: 'warningMessage',
      label: 'label.warning-message',
      width: 150,
      Cell: TooltipTextCell,
    });
  } else {
    columnDescriptions.push({
      key: 'errorMessage',
      label: 'label.error-message',
      width: 150,
      Cell: TooltipTextCell,
    });
  }

  const columns = useColumns<ImportRow>(columnDescriptions, {}, []);

  const filteredEquipment = importRows.filter(row => {
    if (!searchString) {
      return true;
    }
    return (
      row.assetNumber.includes(searchString) ||
      (row.catalogueItemCode && row.catalogueItemCode.includes(searchString)) ||
      row.errorMessage.includes(searchString) ||
      row.id === searchString
    );
  });
  const currentEquipmentPage = filteredEquipment.slice(
    pagination.offset,
    pagination.offset + pagination.first
  );

  return (
    <Grid flexDirection="column" display="flex" gap={0}>
      <SearchBar
        placeholder={t('messages.search')}
        value={searchString}
        debounceTime={300}
        onChange={newValue => {
          setSearchString(newValue);
          setPagination({
            first: pagination.first,
            offset: 0,
            page: 0,
          });
        }}
      />
      <DataTable
        pagination={{
          ...pagination,
          total: filteredEquipment.length,
        }}
        onChangePage={page => {
          setPagination({
            first: pagination.first,
            offset: pagination.first * page,
            page: page,
          });
        }}
        columns={columns}
        data={currentEquipmentPage}
        noDataElement={<NothingHere body={t('error.asset-not-found')} />}
        id={''}
      />
    </Grid>
  );
};
