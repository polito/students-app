import { View, useColorScheme } from 'react-native';

/* import { BlurView, BlurViewProperties } from 'react-native-blur';*/

export const TranslucentView = ({ style = null, blurAmount = 100 }) => {
  const scheme = useColorScheme();
  return (
    <View></View>
    /* <BlurView
      blurType={scheme}
      blurAmount={blurAmount}
      style={{ ...(StyleSheet.absoluteFill as ViewStyle), ... style }}
    />*/
  );
};
