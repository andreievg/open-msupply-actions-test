import { useAuthContext, useGql } from '@openmsupply-client/common';
import { getHostQueries } from '../../api';
import { getSdk } from '../../operations.generated';

export const useHostApi = () => {
  const keys = {
    base: () => ['host'] as const,
    displaySettings: () => [...keys.base(), 'displaySettings'] as const,
    syncSettings: () => [...keys.base(), 'syncSettings'] as const,
    syncStatus: () => [...keys.base(), 'syncStatus'] as const,
    syncInfo: () => [...keys.base(), 'syncStatus'] as const,
  };

  const { client } = useGql();
  const { storeId } = useAuthContext();
  const queries = getHostQueries(getSdk(client));
  return { ...queries, storeId, keys };
};
