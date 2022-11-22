import { StyleSheet, ViewStyle } from 'react-native';

import { BlurView } from '@react-native-community/blur';

export interface TranslucentViewProps {
  style?: ViewStyle;
  blurAmount?: number;
  opacity?: number;
}

export const TranslucentView = ({
  style = null,
  blurAmount = 15,
}: TranslucentViewProps) => {
  return (
    <BlurView
      blurType="ultraThinMaterial"
      blurAmount={blurAmount}
      style={{ ...(StyleSheet.absoluteFill as ViewStyle), ...style }}
    />
  );
};
