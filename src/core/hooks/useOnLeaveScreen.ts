import { useCallback, useEffect, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

/**
 * Runs `onLeave` when the user leaves the current screen, optionally checking
 * if the user spent at least `delay` ms in the screen
 */
export const useOnLeaveScreen = (
  /**
   * Callback
   */
  onLeave: () => void,
  /**
   * Don't fire the event if the user stayed in the page less than `delay` ms
   */
  delay = 2000,
) => {
  const { addListener } = useNavigation();
  const [focusedAt, setFocusedAt] = useState<number>();

  useFocusEffect(
    useCallback(() => {
      if (!focusedAt) {
        setFocusedAt(+new Date());
      }
    }, [focusedAt]),
  );

  useEffect(() => {
    return addListener('beforeRemove', () => {
      if (!delay || +new Date() - focusedAt! >= delay) {
        onLeave();
        setFocusedAt(undefined);
      }
    });
  }, [addListener, delay, focusedAt, onLeave]);
};
