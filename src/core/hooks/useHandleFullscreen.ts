import { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { displayTabBar, hideTabBar } from '../../utils/tab-bar';
import { IS_ANDROID } from '../constants';
import useDeviceOrientation, { ORIENTATION } from './useDeviceOrientation';

export const useHandleFullscreen = (fullscreen: boolean) => {
  const navigation = useNavigation();
  const orientation = useDeviceOrientation();

  console.debug({ orientation });

  useEffect(() => {
    const navRoot = navigation.getParent();
    if (IS_ANDROID) {
      if (orientation === ORIENTATION.LANDSCAPE) {
        StatusBar.setHidden(true, 'none');
        hideTabBar(navRoot);
        navigation.setOptions({ headerShown: false });
      }
      // TODO: probably check if fullscreen enabled
      if (orientation === ORIENTATION.PORTRAIT) {
        StatusBar.setHidden(false, 'slide');
        navigation.setOptions({ headerShown: true });
        displayTabBar(navRoot);
      }
    }
  }, [orientation]);

  useEffect(() => {
    const navRoot = navigation.getParent();
    if (IS_ANDROID) {
      if (fullscreen) {
        StatusBar.setHidden(true, 'none');
        hideTabBar(navRoot);
        navigation.setOptions({ headerShown: false });
      } else {
        StatusBar.setHidden(false, 'slide');
        navigation.setOptions({ headerShown: true });
        displayTabBar(navRoot);
      }
    }
    return () => {
      StatusBar.setHidden(false, 'slide');
      navigation.setOptions({ headerShown: true });
      displayTabBar(navRoot);
    };
  }, [fullscreen]);
};
