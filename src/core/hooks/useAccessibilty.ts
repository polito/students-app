import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo } from 'react-native';

import { useScreenReader } from './useScreenReader';

export function useAccessibility() {
  const { t } = useTranslation();
  const { isEnabled, announce } = useScreenReader();

  /**
   * Creates an accessibility label for list items with position info.
   * Example: "Element 2 of 5. Course name"
   */
  const accessibilityListLabel = useCallback(
    (index: number, total: number, extraText?: string) => {
      const text = t('common.elementCount', {
        count: index + 1,
        total: total,
      });
      return `${text}. ${extraText ?? ''}`;
    },
    [t],
  );

  /**
   * Creates accessibility props for a list container.
   * Announces that it's a list with the total number of items.
   */
  const getListAccessibilityProps = useCallback(
    (listName: string, itemCount: number) => {
      return {
        accessible: true,
        accessibilityRole: 'list' as const,
        accessibilityLabel: t('common.listWithCount', {
          name: listName,
          count: itemCount,
        }),
      };
    },
    [t],
  );

  /**
   * Creates accessibility props for a tappable element with exhaustive description.
   */
  const getTappableAccessibilityProps = useCallback(
    (label: string, hint?: string, role: 'button' | 'link' = 'button') => {
      return {
        accessible: true,
        accessibilityRole: role,
        accessibilityLabel: label,
        accessibilityHint: hint ?? t('common.tapToNavigate'),
      };
    },
    [t],
  );

  /**
   * Creates accessibility label for badge with new items count.
   */
  const getBadgeAccessibilityLabel = useCallback(
    (badgeCount: number, sectionName?: string) => {
      if (badgeCount === 0) return sectionName ?? '';
      const badgeText =
        badgeCount === 1
          ? t('common.newItems', { count: badgeCount })
          : t('common.newItems_plural', { count: badgeCount });
      return sectionName ? `${sectionName}, ${badgeText}` : badgeText;
    },
    [t],
  );

  /**
   * Announces loading state when screen reader is enabled.
   */
  const announceLoading = useCallback(() => {
    if (isEnabled) {
      announce(t('common.loading'));
    }
  }, [isEnabled, announce, t]);

  /**
   * Announces a message when screen reader is enabled.
   */
  const announceIfEnabled = useCallback(
    (message: string) => {
      if (isEnabled) {
        announce(message);
      }
    },
    [isEnabled, announce],
  );

  return {
    isScreenReaderEnabled: isEnabled,
    accessibilityListLabel,
    getListAccessibilityProps,
    getTappableAccessibilityProps,
    getBadgeAccessibilityLabel,
    announceLoading,
    announceIfEnabled,
  };
}

/**
 * Hook to announce loading state automatically when it changes.
 * Announces "Loading" when loading becomes true.
 */
export function useAnnounceLoading(isLoading: boolean) {
  const { t } = useTranslation();
  const prevLoadingRef = useRef(isLoading);

  useEffect(() => {
    // Only announce when loading state changes to true
    if (isLoading && !prevLoadingRef.current) {
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        if (enabled) {
          AccessibilityInfo.announceForAccessibility(t('common.loading'));
        }
      });
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, t]);
}
