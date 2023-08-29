import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  RefreshControl as RNRefreshControl,
  RefreshControlProps,
} from 'react-native';

import { UseQueryResult, onlineManager } from '@tanstack/react-query';

import { usePrevious } from '../../../src/core/hooks/usePrevious';

type Props = Omit<RefreshControlProps, 'refreshing'> & {
  queries: UseQueryResult[];
  /** Only trigger refresh updates on manual refresh */
  manual?: boolean;
};

/**
 * An accessible RefreshControl extension that connects to one or more TanStack
 * Query queries
 */
export const RefreshControl = ({ queries, manual = false, ...rest }: Props) => {
  const isFetching = queries.some(q => q.isFetching);
  const [refreshing, setRefreshing] = useState(manual ? false : isFetching);
  const [firstLoading, setFirstLoading] = useState(true);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const previousRefreshing = usePrevious(refreshing);
  const { t } = useTranslation();

  useEffect(() => {
    if (!manual && firstLoading) {
      if (isFetching !== refreshing) {
        setRefreshing(isFetching);
        if (!isFetching) {
          setFirstLoading(false);
        }
      }
    }
  }, [manual, isFetching, refreshing, firstLoading]);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(res =>
      setScreenReaderEnabled(res),
    );
  }, []);

  useEffect(() => {
    if (screenReaderEnabled) {
      if (refreshing) {
        AccessibilityInfo.announceForAccessibility(t('common.startRefresh'));
      }
      if (!refreshing && previousRefreshing === true) {
        AccessibilityInfo.announceForAccessibility(t('common.endRefresh'));
      }
    }
  }, [refreshing, screenReaderEnabled]);

  const onRefresh = useCallback(() => {
    if (!onlineManager.isOnline()) return;
    setRefreshing(true);
    Promise.all(queries.map(q => q.refetch())).finally(() => {
      setRefreshing(false);
    });
  }, [queries]);

  return (
    <RNRefreshControl refreshing={refreshing} onRefresh={onRefresh} {...rest} />
  );
};
