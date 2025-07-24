import { useCallback } from 'react';
import { Platform } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { tabBarStyle } from '../../utils/tab-bar';

export const useHideTabs = (
  onFocusIn?: () => void,
  onFocusOut?: () => void,
) => {
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      // Ios tab bar is hidden by default in modal context
      if (Platform.OS === 'android') {
        parent?.setOptions({
          tabBarStyle: { display: 'none' },
        });
      }
      onFocusIn?.();
      return () => {
        if (Platform.OS === 'android') {
          parent?.setOptions({
            tabBarStyle,
          });
        }
        onFocusOut?.();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation]),
  );
};
