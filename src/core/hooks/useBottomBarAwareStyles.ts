import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export const useBottomBarAwareStyles = () => {
  const bottomBarHeight = useBottomTabBarHeight();
  const { spacing } = useTheme();
  return {
    paddingBottom:
      +(Platform.select({ ios: bottomBarHeight }) ?? 0) + +spacing[5],
  };
};
