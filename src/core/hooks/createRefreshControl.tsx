import { RefreshControl } from 'react-native';

import { UseQueryResult } from '@tanstack/react-query';

/**
 * Creates a RefreshControl bound to one or more UseQueryResult
 */
export const createRefreshControl = (...queries: Array<UseQueryResult>) => (
  <RefreshControl
    refreshing={queries.some(q => q.isLoading)}
    onRefresh={() => {
      queries.forEach(q => q.refetch());
    }}
  />
);
