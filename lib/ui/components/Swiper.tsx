import { ReactElement, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { CarouselDots } from '@lib/ui/components/CarouselDots';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { useDeviceDimension } from '../../../src/core/hooks/useDeviceDimension';

// isFullScreen property is necessary on Android to enable full-screen
// functionality for multiple lectures, allowing proper adjustment of the Swiper's height.

type SwiperProps<T> = {
  items: readonly T[];
  renderItem: (item: ListRenderItemInfo<T>) => ReactElement;
  keyExtractor: (item: T) => string;
  onIndexChanged: (newIndex: number, oldIndex: number) => void;
  isFullScreen?: boolean;
};

export const Swiper = <T,>({
  items,
  renderItem,
  keyExtractor,
  onIndexChanged,
  isFullScreen = false,
}: SwiperProps<T>) => {
  const styles = useStylesheet(createStyles);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const dimensions = useDeviceDimension();

  return (
    <View style={{ height: isFullScreen ? '100%' : 'auto' }}>
      <FlatList
        scrollEnabled={!isFullScreen}
        data={items}
        horizontal
        pagingEnabled
        keyExtractor={keyExtractor}
        onScroll={({
          nativeEvent: {
            contentOffset: { x },
          },
        }) => {
          const newIndex = Math.max(0, Math.round(x / dimensions.screen.width));
          setCurrentPageIndex(oldIndex => {
            if (oldIndex === newIndex) return oldIndex;
            onIndexChanged(newIndex, oldIndex);
            return newIndex;
          });
        }}
        scrollEventThrottle={100}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        extraData={items}
      />

      <View style={styles.dotsContainer}>
        <CarouselDots
          carouselLength={items.length ?? 0}
          carouselIndex={currentPageIndex}
          expandedDotsCounts={4}
        />
      </View>
    </View>
  );
};
const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    dotsContainer: {
      alignItems: 'center',
      marginVertical: spacing[4],
    },
    dot: {
      marginHorizontal: spacing[1],
    },
  });
