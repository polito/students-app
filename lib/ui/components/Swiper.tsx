import { ReactElement, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarouselDots } from '@lib/ui/components/CarouselDots';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

type SwiperProps<T> = {
  items: readonly T[];
  renderItem: (item: ListRenderItemInfo<T>) => ReactElement;
  keyExtractor: (item: T) => string;
  index: number;
  onIndexChanged: (newIndex: number) => void;
};

export const Swiper = <T,>({
  items,
  renderItem,
  keyExtractor,
  index,
  onIndexChanged,
}: SwiperProps<T>) => {
  const styles = useStylesheet(createStyles);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(index);
  const pageSliderRef = useRef<FlatList>(null);
  const { bottom: marginBottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  useEffect(() => {
    setCurrentPageIndex(index);
  }, [index]);

  return (
    <View
      style={[
        styles.screen,
        {
          marginBottom,
        },
      ]}
    >
      <FlatList
        ref={pageSliderRef}
        data={items}
        horizontal
        pagingEnabled
        keyExtractor={keyExtractor}
        onScroll={({
          nativeEvent: {
            contentOffset: { x },
          },
        }) => {
          const newIndex = Math.max(0, Math.round(x / width));
          setCurrentPageIndex(newIndex);
          onIndexChanged(newIndex);
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
    screen: {
      flex: 1,
    },
    dotsContainer: {
      alignItems: 'center',
      height: 6,
      marginVertical: spacing[4],
    },
    dot: {
      marginHorizontal: spacing[1],
    },
  });
