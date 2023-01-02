import { useTheme } from '@lib/ui/hooks/useTheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export const useBottomBarAwareStyles = () => {
  const bottomBarHeight = useBottomTabBarHeight();
  const { spacing } = useTheme();
  return {
    paddingBottom: bottomBarHeight + +spacing[5],
  };
};
