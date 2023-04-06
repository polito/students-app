import { useCallback, useEffect, useState } from 'react';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { UseQueryResult } from '@tanstack/react-query';

import { IS_IOS } from '../constants';

/**
 * A modified version of useRefreshControl to be used with ScrollViews inside
 * large title screens to prevent the title from collapsing
 */
export const useLargeHeaderRefreshControl = (...queries: UseQueryResult[]) => {
  const isFetching = queries.some(q => q.isFetching);
  const [refreshing, setRefreshing] = useState(isFetching);
  const [firstLoading, setFirstLoading] = useState(true);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (firstLoading && isFetching !== refreshing) {
      setRefreshing(isFetching);
      if (IS_IOS) {
        setTimeout(() => {
          setHeight(0);
          setTimeout(() => {
            setHeight(undefined);
            setFirstLoading(false);
          });
        });
      }
    }
  }, [firstLoading, refreshing, isFetching]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all(queries.map(q => q.refetch())).finally(() => {
      setRefreshing(false);
    });
  }, [queries]);

  return {
    refreshControl: (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    ),
    contentContainerStyle: IS_IOS
      ? {
          height,
          minHeight: height === 0 ? undefined : '100%',
          opacity: height === 0 ? 0 : 1,
        }
      : undefined,
  };
};
