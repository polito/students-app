import { useMemo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import { useTheme as useNavigationTheme } from '@react-navigation/native';

export interface TranslucentViewProps {
  style?: ViewStyle;
  blurAmount?: number;
  opacity?: number;
}

export const TranslucentView = ({
  style = null,
  blurAmount = 15,
}: TranslucentViewProps) => {
  const { dark } = useNavigationTheme();
  const { colors } = useTheme();

  const blurViewProps: Partial<BlurViewProps> = useMemo(
    () => ({
      blurType: 'ultraThinMaterial',
      reducedTransparencyFallbackColor: colors.surface,
    }),
    [dark],
  );
  return (
    <BlurView
      {...blurViewProps}
      blurAmount={blurAmount}
      style={{ ...(StyleSheet.absoluteFill as ViewStyle), ...style }}
    />
  );
};
