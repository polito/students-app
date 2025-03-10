import { ReactElement, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';

import { CarouselDots } from '@lib/ui/components/CarouselDots';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { useDeviceRotation } from '../../../src/core/hooks/useDeviceRotation.ts';

// isFullScreen property is necessary on Android to enable full-screen
// functionality for multiple lectures, allowing proper adjustment of the Swiper's height.

type SwiperProps<T> = {
  items: readonly T[];
  renderItem: (item: ListRenderItemInfo<T>) => ReactElement;
  keyExtractor: (item: T) => string;
  onIndexChanged: (newIndex: number) => void;
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
  const [width, setWidth] = useState(Dimensions.get('screen').width);
  const flatListRef = useRef<FlatList>(null);
  const { isRotating } = useDeviceRotation();

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: currentPageIndex,
        animated: false,
      });
    }
  }, [currentPageIndex, isFullScreen]);

  useEffect(() => {
    const updateDimensions = () => {
      const { width: newWidth } = Dimensions.get('screen');
      setWidth(newWidth);
    };
    Dimensions.addEventListener('change', updateDimensions);
  }, []);

  return (
    <View
      style={{
        height: isFullScreen ? '100%' : 'auto',
        width: isFullScreen ? '100%' : 'auto',
      }}
    >
      <FlatList
        ref={flatListRef}
        data={items}
        scrollEnabled={!isFullScreen}
        horizontal
        pagingEnabled
        keyExtractor={item => keyExtractor(item)}
        onScroll={({
          nativeEvent: {
            contentOffset: { x },
          },
        }) => {
          if (isRotating) return;
          if (!isFullScreen) {
            const newIndex = Math.max(0, Math.round(x / width));
            setCurrentPageIndex(oldIndex => {
              if (oldIndex === newIndex) return oldIndex;
              onIndexChanged(newIndex);
              return newIndex;
            });
          }
        }}
        scrollEventThrottle={100}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        extraData={[currentPageIndex, renderItem, items]}
        automaticallyAdjustContentInsets={true}
        snapToAlignment="center"
        centerContent
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToIndex({
            index: currentPageIndex,
            animated: false,
          })
        }
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
