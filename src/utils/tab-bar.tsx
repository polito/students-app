import { ViewStyle } from 'react-native';

import { NavigationProp } from '@react-navigation/native';

export const tabBarStyle: ViewStyle = {
  position: 'absolute',
  display: 'flex',
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
