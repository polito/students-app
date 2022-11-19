import { Platform, ViewStyle } from 'react-native';

import { NavigationProp } from '@react-navigation/native';

export const tabBarStyle: ViewStyle = {
  position: 'absolute',
  height: Platform.OS === 'ios' ? 84 : 60,
};

export const hideTabBar = (navigation: NavigationProp<any>) => {
  navigation.setOptions({
    tabBarStyle: {
      display: 'none',
    },
  });
};

export const displayTabBar = (navigation: NavigationProp<any>) => {
  navigation.setOptions({
    tabBarStyle,
  });
};
