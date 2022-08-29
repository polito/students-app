import { Platform } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export const useBottomBarAwareStyles = () => {
  const bottomBarHeight = useBottomTabBarHeight();
  return {
    marginBottom: Platform.select({ ios: bottomBarHeight }),
  };
};
