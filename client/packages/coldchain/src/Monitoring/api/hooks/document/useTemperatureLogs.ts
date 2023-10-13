import { useUrlQueryParams } from '@common/hooks';
import { useTemperatureLogApi } from '../utils/useTemperatureLogApi';
import { useQuery } from 'packages/common/src';

export const useTemperatureLogs = () => {
  const { queryParams } = useUrlQueryParams({
    initialSort: { key: 'datetime', dir: 'asc' },
    filterKey: 'datetime',
  });

  const api = useTemperatureLogApi();

  return {
    ...useQuery(api.keys.paramList(queryParams), api.get.list(queryParams)),
  };
};
