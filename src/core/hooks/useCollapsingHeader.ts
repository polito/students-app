import { useContext, useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { CollapsingHeaderContext } from '../contexts/CollapsingHeaderContext';

export const useCollapsingHeader = () => {
  const headerHeight = useHeaderHeight();
  const [count, setCount] = useState(0);
  const [collapsedHeaderHeight, setCollapsedHeaderHeight] =
    useState(headerHeight);
  const { scrollTop, enabled, setEnabled } = useContext(
    CollapsingHeaderContext,
  );

  if (!enabled) {
    setEnabled(true);
  }

  useEffect(() => {
    if (count < 2) {
      setCollapsedHeaderHeight(headerHeight);
      setCount(c => c + 1);
    }
  }, [headerHeight]);

  return {
    scrollTop,
    scrollViewProps: scrollTop
      ? {
          style: {
            paddingTop: collapsedHeaderHeight,
          },
          onScroll: Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollTop } } }],
            { useNativeDriver: false },
          ),
          scrollEventThrottle: 16,
        }
      : {},
  };
};
