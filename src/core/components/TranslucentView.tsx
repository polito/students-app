import { PropsWithChildren } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { BlurView, BlurViewProps } from 'expo-blur';

export const TranslucentView = ({
  style = null,
  children,
  intensity = 100,
}: PropsWithChildren<BlurViewProps>) => {
  const scheme = useColorScheme();
  return (
    <BlurView
      tint={scheme}
      intensity={intensity}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </BlurView>
  );
};
