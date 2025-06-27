import { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { displayTabBar, hideTabBar } from '../../utils/tab-bar';
import { IS_ANDROID } from '../constants';

export const useFullscreenUi = (fullscreen: boolean) => {
  const navigation = useNavigation();

  useEffect(() => {
    const navRoot = navigation.getParent()!;
    if (IS_ANDROID) {
      if (fullscreen) {
        hideTabBar(navRoot);
        navigation.setOptions({ headerShown: false });
      }
    }
    return () => {
      StatusBar.setHidden(false, 'slide');
      navigation.setOptions({ headerShown: true });
      displayTabBar(navRoot);
    };
  }, [fullscreen, navigation]);
};
