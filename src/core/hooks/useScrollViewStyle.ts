import { useTheme } from '@lib/ui/hooks/useTheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';

export const useScrollViewStyle = () => {
  const headerHeight = useHeaderHeight();
  const bottomBarHeight = useBottomTabBarHeight();
  const { spacing } = useTheme();

  console.debug({ bottomBarHeight });

  return {
    paddingTop: headerHeight + Number(spacing['2']),
    // paddingBottom: bottomBarHeight +  headerHeight + Number(spacing['2']),
  };
};
