import { Animated } from 'react-native';
import { useRoute } from '@react-navigation/native';

export const useCollapsingHeader = () => {
  const {
    params: { scrollTop },
  } = useRoute<any>();
  if (!scrollTop) {
    return {};
  }
  return {
    onScroll: Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollTop } } }],
      { useNativeDriver: false },
    ),
    scrollEventThrottle: 16,
  };
};
