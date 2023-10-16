import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export const useKeyboardVisibile = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.select({ ios: 'keyboardDidShow', android: 'keyboardDidShow' })!,
      () => {
        setKeyboardVisible(true);
      },
    );
    const hideSubscription = Keyboard.addListener(
      Platform.select({ ios: 'keyboardDidHide', android: 'keyboardDidHide' })!,
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardVisible;
};
