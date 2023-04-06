import { UseQueryResult } from '@tanstack/react-query';

export const useRefreshControl = (...queries: UseQueryResult[]) => {
  return {
    refreshing: queries.some(q => q.isFetching),
    onRefresh: () => {
      queries.forEach(q => q.refetch());
    },
  };
};
