import { useRef } from 'react';
import { Animated, Platform } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

export const useSubHeader = () => {
  const headerHeight = useHeaderHeight();
  const scrollTopRef = useRef(new Animated.Value(0));

  return {
    subHeaderProps: { scrollTop: scrollTopRef.current },
    scrollViewProps: {
      onScroll:
        Platform.OS === 'ios'
          ? Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollTopRef.current } } }],
              { useNativeDriver: false },
            )
          : undefined,
      scrollEventThrottle: 16,
      stickyHeaderIndices: [0],
      contentInset: { top: Platform.select({ ios: headerHeight }) },
      contentOffset: { x: 0, y: Platform.select({ ios: -headerHeight }) },
    },
  };
};
