import { StyleSheet, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';

export const TranslucentView = ({ style = null }) => {
  const scheme = useColorScheme();
  return (
    <BlurView
      tint={scheme}
      intensity={100}
      style={[StyleSheet.absoluteFill, style]}
    />
  );
};
