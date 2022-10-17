import { StyleSheet, ViewStyle, useColorScheme } from 'react-native';

import { BlurView } from '@react-native-community/blur';

export const TranslucentView = ({ style = null, blurAmount = 100 }) => {
  const scheme = useColorScheme();
  return (
    <BlurView
      blurType={scheme}
      blurAmount={blurAmount}
      style={{ ...(StyleSheet.absoluteFill as ViewStyle), ...style }}
    />
  );
};
