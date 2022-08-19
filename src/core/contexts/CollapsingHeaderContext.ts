import { createContext } from 'react';
import { Animated } from 'react-native';

const defaultValue = {
  scrollTop: new Animated.Value(0),
  enabled: false,
} as {
  scrollTop: Animated.Value;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

defaultValue.setEnabled = (enabled: boolean) => {
  defaultValue.enabled = enabled;
};

export const CollapsingHeaderContext = createContext(defaultValue);
