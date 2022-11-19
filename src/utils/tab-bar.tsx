import { Platform, ViewStyle } from 'react-native';

import { NavigationProp } from '@react-navigation/native';

export const tabBarStyle: ViewStyle = {
  display: 'flex',
  position: Platform.OS === 'ios' ? 'absolute' : undefined,
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
