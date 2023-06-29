import { useContext } from 'react';

import BottomTabBarHeightContext from '@react-navigation/bottom-tabs/src/utils/BottomTabBarHeightContext';

/**
 * A useBottomTabBarHeight alternative that doesn't throw when outside
 * a bottom tab bar navigator but returns 0 instead
 */
export const useSafeBottomBarHeight = () => {
  const height = useContext(BottomTabBarHeightContext);
  return height ?? 0;
};
