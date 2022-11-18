import { RefreshControl } from 'react-native';

import { UseQueryResult } from '@tanstack/react-query';

interface Props {
  queries: Array<UseQueryResult>;
}

export const QueryRefreshControl = ({ queries }: Props) => {
  return (
    <RefreshControl
      refreshing={queries.some(q => q.isLoading)}
      onRefresh={() => {
        queries.forEach(q => q.refetch());
      }}
    />
  );
};
