import { View } from 'react-native';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export const BottomBarSpacer = () => {
  const bottomBarHeight = useBottomTabBarHeight();

  return <View style={{ height: bottomBarHeight }} />;
};
