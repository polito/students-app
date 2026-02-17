import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  FlatList,
  FlatListProps,
  View,
  ViewStyle,
} from 'react-native';

import { useAccessibility } from '../hooks/useAccessibilty';

interface AccessibleFlatListProps<T> extends FlatListProps<T> {
  /**
   * Name of the list for accessibility announcement.
   * e.g., "Courses", "Exams", etc.
   */
  readonly listName: string;
  /**
   * If true, announces the list count when the list is focused.
   * Defaults to true.
   */
  readonly announceOnFocus?: boolean;
  /**
   * Custom container style for the accessible wrapper.
   */
  readonly containerStyle?: ViewStyle;
}

/**
 * A FlatList wrapper that provides accessibility features:
 * - Announces list name and count when focused
 * - Each item includes position info ("Element X of Y")
 */
export function AccessibleFlatList<T>(
  props: Readonly<AccessibleFlatListProps<T>>,
) {
  const {
    listName,
    announceOnFocus = true,
    containerStyle,
    renderItem,
    data,
    ...rest
  } = props;
  const { t } = useTranslation();
  const { accessibilityListLabel } = useAccessibility();
  const itemCount = data?.length ?? 0;

  const accessibleRenderItem = useCallback(
    (info: { item: T; index: number; separators: any }) => {
      if (!renderItem) return null;

      const element = renderItem(info);
      const positionLabel = accessibilityListLabel(info.index, itemCount);

      return (
        <View
          accessible={false}
          accessibilityLabel={positionLabel}
          importantForAccessibility="no"
        >
          {element}
        </View>
      );
    },
    [renderItem, accessibilityListLabel, itemCount],
  );

  const handleAccessibilityFocus = useCallback(() => {
    if (announceOnFocus && itemCount > 0) {
      const announcement = t('common.listWithCount', {
        name: listName,
        count: itemCount,
      });
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [announceOnFocus, itemCount, listName, t]);

  return (
    <View
      style={containerStyle}
      accessible={true}
      accessibilityRole="list"
      accessibilityLabel={t('common.listWithCount', {
        name: listName,
        count: itemCount,
      })}
      onAccessibilityTap={handleAccessibilityFocus}
    >
      <FlatList data={data} renderItem={accessibleRenderItem} {...rest} />
    </View>
  );
}
