import { PropsWithChildren, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, View } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useScreenReader } from '../../../src/core/hooks/useScreenReader';

type Props = PropsWithChildren<{
  loading: boolean;
  /**
   * If true, announces "Loading" automatically when loading state becomes true
   * and screen reader is enabled. Defaults to true.
   */
  announceLoading?: boolean;
}>;
export const LoadingContainer = ({
  children,
  loading,
  announceLoading = true,
  ...rest
}: Props) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isEnabled, announce } = useScreenReader();
  const prevLoadingRef = useRef(loading);

  // Automatically announce loading state when it changes to true
  useEffect(() => {
    if (announceLoading && loading && !prevLoadingRef.current) {
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        if (enabled) {
          AccessibilityInfo.announceForAccessibility(t('common.loading'));
        }
      });
    }
    prevLoadingRef.current = loading;
  }, [loading, announceLoading, t]);

  return (
    <View
      accessible={loading}
      accessibilityRole={loading ? 'progressbar' : undefined}
      accessibilityLabel={loading ? t('common.loading') : undefined}
      accessibilityState={{ busy: loading }}
      onAccessibilityTap={() => {
        if (loading && isEnabled) {
          announce(t('common.loading'));
        }
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          accessible={true}
          accessibilityLabel={t('common.loading')}
          style={{
            marginVertical: spacing[8],
          }}
        />
      ) : (
        children
      )}
    </View>
  );
};
