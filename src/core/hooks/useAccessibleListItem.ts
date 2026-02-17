import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, AccessibilityRole } from 'react-native';

/**
 * Hook for creating accessible list item props.
 * Use this when you want to add list position info to items without
 * using AccessibleFlatList.
 */
export function useAccessibleListItem() {
  const { t } = useTranslation();

  /**
   * Creates accessibility props for a list item with position info.
   *
   * @param index - Current item index (0-based)
   * @param total - Total number of items in the list
   * @param label - Main accessibility label for the item
   * @param hint - Optional accessibility hint
   * @param role - Accessibility role (defaults to 'button' for tappable items)
   * @returns Object with accessibility props to spread on the component
   */
  const getListItemAccessibilityProps = useCallback(
    (
      index: number,
      total: number,
      label: string,
      hint?: string,
      role: AccessibilityRole = 'button',
    ) => {
      const positionLabel = t('common.elementCount', {
        count: index + 1,
        total,
      });

      return {
        accessible: true,
        accessibilityRole: role,
        accessibilityLabel: `${positionLabel}. ${label}`,
        ...(hint && { accessibilityHint: hint }),
      };
    },
    [t],
  );

  /**
   * Creates accessibility props for a list container.
   *
   * @param name - List name (e.g., "Courses", "Exams")
   * @param count - Number of items in the list
   * @returns Object with accessibility props to spread on the container
   */
  const getListContainerAccessibilityProps = useCallback(
    (name: string, count: number) => {
      return {
        accessible: true,
        accessibilityRole: 'list' as const,
        accessibilityLabel: t('common.listWithCount', { name, count }),
      };
    },
    [t],
  );

  /**
   * Announces list info via screen reader.
   *
   * @param name - List name
   * @param count - Number of items
   */
  const announceListInfo = useCallback(
    (name: string, count: number) => {
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        if (enabled) {
          AccessibilityInfo.announceForAccessibility(
            t('common.listWithCount', { name, count }),
          );
        }
      });
    },
    [t],
  );

  return {
    getListItemAccessibilityProps,
    getListContainerAccessibilityProps,
    announceListInfo,
  };
}
