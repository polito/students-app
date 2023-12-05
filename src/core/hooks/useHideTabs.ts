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
      // Ios tab bar is hidden by default in modal context
      if (Platform.OS === 'ios') return;
      const parent = navigation.getParent()!;
      parent.setOptions({
        tabBarStyle: { display: 'none' },
      });
      onFocusIn && onFocusIn();
      return () => {
        parent.setOptions({
          tabBarStyle,
        });
        onFocusOut && onFocusOut();
      };
    }, [navigation, onFocusIn, onFocusOut]),
  );
};
