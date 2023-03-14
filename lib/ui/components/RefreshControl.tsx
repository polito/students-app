import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  RefreshControl as RNRefreshControl,
  RefreshControlProps,
} from 'react-native';

import { usePrevious } from '../../../src/core/hooks/usePrevious';

export const RefreshControl = ({
  refreshing,
  ...rest
}: RefreshControlProps) => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const previousRefreshing = usePrevious(refreshing);
  const { t } = useTranslation();

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

  return <RNRefreshControl refreshing={refreshing} {...rest} />;
};
