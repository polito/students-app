import { useMemo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { BlurView, BlurViewProps } from '@react-native-community/blur';

export interface TranslucentViewProps {
  style?: ViewStyle;
  blurAmount?: number;
  fallbackOpacity?: number;
}

export const TranslucentView = ({
  style,
  blurAmount = 15,
}: TranslucentViewProps) => {
  const { dark, colors } = useTheme();

  const blurViewProps: Partial<BlurViewProps> = useMemo(
    () => ({
      blurType: dark ? 'ultraThinMaterialDark' : 'ultraThinMaterialLight',
      reducedTransparencyFallbackColor: colors.surface,
    }),
    [dark],
  );

  return (
    <BlurView
      blurAmount={blurAmount}
      style={[StyleSheet.absoluteFill, style]}
      {...blurViewProps}
    />
  );
};
