import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useScreenReader = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(res => setEnabled(res));
  }, []);

  const announce = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  return {
    isEnabled: enabled,
    announce,
    isScreenReaderEnabled: AccessibilityInfo.isScreenReaderEnabled,
  };
};
