import { StyleSheet, ViewStyle, useColorScheme } from 'react-native';

import { BlurView } from '@react-native-community/blur';

export interface TranslucentViewProps {
  style?: ViewStyle;
  blurAmount?: number;
  opacity?: number;
}

export const TranslucentView = ({
  style = null,
  blurAmount = 5,
}: TranslucentViewProps) => {
  const scheme = useColorScheme();
  return (
    <BlurView
      blurType={scheme}
      blurAmount={blurAmount}
      style={{ ...(StyleSheet.absoluteFill as ViewStyle), ...style }}
    />
  );
};
