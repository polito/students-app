import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { displayTabBar, hideTabBar } from '../../utils/tab-bar';

export const useHandleFullscreen = (fullscreen: boolean) => {
  const navigation = useNavigation();

  useEffect(() => {
    const navRoot = navigation.getParent();
    if (Platform.OS !== 'ios') {
      if (fullscreen) {
        navigation.setOptions({
          headerShown: false,
          orientation: 'landscape',
        });
        StatusBar.setHidden(true, 'none');
        hideTabBar(navRoot);
      } else {
        navigation.setOptions({
          headerShown: true,
          orientation: 'portrait',
        });
        StatusBar.setHidden(false, 'slide');
        displayTabBar(navRoot);
      }
    }

    return () => {
      displayTabBar(navRoot);
      navigation.setOptions({
        headerShown: false,
        orientation: 'portrait',
      });
    };
  }, [fullscreen]);
};
