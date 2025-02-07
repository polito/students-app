import { AccessibilityInfo } from 'react-native';

export const setTimeoutAccessibilityInfoHelper = (
  message: string,
  ms: number,
) => {
  setTimeout(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, ms);
};
