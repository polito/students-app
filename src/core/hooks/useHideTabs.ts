import { useCallback } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

export const useHideTabs = (
  onFocusIn?: () => void,
  onFocusOut?: () => void,
) => {
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent()!;
      parent.setOptions({
        tabBarVisible: false,
      });
      onFocusIn && onFocusIn();
      return () => {
        parent.setOptions({
          tabBarVisible: true,
        });
        onFocusOut && onFocusOut();
      };
    }, [navigation, onFocusIn, onFocusOut]),
  );
};
