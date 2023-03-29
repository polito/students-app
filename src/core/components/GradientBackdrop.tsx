import { StyleSheet } from 'react-native';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';

export const GradientBackdrop = () => {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="100%">
          <Stop offset="0" stopColor="black" stopOpacity="0.9" />
          <Stop offset="0.2" stopColor="black" stopOpacity="0.5" />
          <Stop offset="0.3" stopColor="black" stopOpacity="0.3" />
          <Stop offset="0.5" stopColor="black" stopOpacity="0.2" />
          <Stop offset="0.7" stopColor="black" stopOpacity="0.3" />
          <Stop offset="0.8" stopColor="black" stopOpacity="0.5" />
          <Stop offset="1" stopColor="black" stopOpacity="0.9" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
    </Svg>
  );
};
