import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { BlurView, BlurViewProps } from '@react-native-community/blur';

import type { TranslucentViewProps } from './TranslucentView';

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
