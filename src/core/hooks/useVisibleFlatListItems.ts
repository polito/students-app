import { useCallback, useState } from 'react';
import { FlatListProps } from 'react-native';

type VisibleItemsMap = Record<number, true | undefined>;

const defaultViewabilityConfig: {
  minimumViewTime?: number;
  viewAreaCoveragePercentThreshold?: number;
  itemVisiblePercentThreshold?: number;
  waitForInteraction?: boolean;
} = {
  minimumViewTime: 2000,
  itemVisiblePercentThreshold: 100,
  waitForInteraction: true,
};

/**
 * Exports a `visibleItemsIndexes` mapping that contains the currently visible items according to `viewabilityConfig`
 * and the necessary props to be forwarded to FlatList
 *
 * @example
 * ```typescript
 * const {visibleItemsIndexes, ...viewabilityFlatListProps} = useVisibleFlatListItems();
 *
 * <FlatList {...viewabilityFlatListProps} />
 * <Item isVisible={!!visibleItemsIndexes[index]} />
 * ```
 */
export const useVisibleFlatListItems = (
  viewabilityConfig = defaultViewabilityConfig,
) => {
  const [visibleItemsIndexes, setVisibleItemsIndexes] = useState(
    {} as VisibleItemsMap,
  );
  const onViewableItemsChanged = useCallback<
    Exclude<FlatListProps<unknown>['onViewableItemsChanged'], undefined | null>
  >(({ viewableItems }) => {
    setVisibleItemsIndexes(
      viewableItems.reduce((acc, val) => {
        acc[val.index!] = true;
        return acc;
      }, {} as VisibleItemsMap),
    );
  }, []);

  return {
    visibleItemsIndexes,
    onViewableItemsChanged,
    viewabilityConfig,
  };
};
