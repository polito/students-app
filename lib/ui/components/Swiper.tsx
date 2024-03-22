import { ReactElement, useState } from 'react';
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
  onIndexChanged: (newIndex: number, oldIndex: number) => void;
};

export const Swiper = <T,>({
  items,
  renderItem,
  keyExtractor,
  onIndexChanged,
}: SwiperProps<T>) => {
  const styles = useStylesheet(createStyles);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const { bottom: marginBottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

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
