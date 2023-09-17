import React, { FC } from 'react';
import {
  TableProvider,
  DataTable,
  createTableStore,
  NothingHere,
  createQueryParamsStore,
  useNavigate,
  RouteBuilder,
  useQueryParamsStore,
  EncounterSortFieldInput,
  useUrlQueryParams,
} from '@openmsupply-client/common';
import { AppRoute } from '@openmsupply-client/config';
import {
  EncounterFragmentWithStatus,
  useEncounterFragmentWithStatus,
} from '../../Encounter';
import { useEncounterListColumns } from '../../Encounter/ListView/columns';
import { useEncounter } from '@openmsupply-client/programs';
import { usePatient } from '../api';

const EncounterListComponent: FC = () => {
  const {
    sort: { sortBy, onChangeSortBy },
  } = useQueryParamsStore();

  const {
    queryParams: { page, first, offset, filterBy },
    updatePaginationQuery,
  } = useUrlQueryParams();

  const patientId = usePatient.utils.id();
  const { data, isError, isLoading } = useEncounter.document.list({
    pagination: { first, offset },
    // enforce filtering by patient id
    filterBy: { ...filterBy, patientId: { equalTo: patientId } },
    sortBy: {
      key: sortBy.key as EncounterSortFieldInput,
      isDesc: sortBy.isDesc,
      direction: sortBy.isDesc ? 'desc' : 'asc',
    },
  });
  const dataWithStatus: EncounterFragmentWithStatus[] | undefined =
    useEncounterFragmentWithStatus(data?.nodes);
  const navigate = useNavigate();

  const columns = useEncounterListColumns({ onChangeSortBy, sortBy });

  return (
    <DataTable
      id="encounter-list"
      pagination={{ page, first, offset, total: data?.totalCount }}
      onChangePage={updatePaginationQuery}
      columns={columns}
      data={dataWithStatus}
      isLoading={isLoading}
      isError={isError}
      onRowClick={row => {
        navigate(
          RouteBuilder.create(AppRoute.Dispensary)
            .addPart(AppRoute.Encounter)
            .addPart(row.id)
            .build()
        );
      }}
      noDataElement={<NothingHere />}
    />
  );
};

export const EncounterListView: FC = () => (
  <TableProvider
    createStore={createTableStore}
    queryParamsStore={createQueryParamsStore<EncounterFragmentWithStatus>({
      initialSortBy: {
        key: EncounterSortFieldInput.StartDatetime,
        isDesc: true,
      },
    })}
  >
    <EncounterListComponent />
  </TableProvider>
);
