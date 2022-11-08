import { View } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { TranslucentViewProps } from './TranslucentView';

export const TranslucentView = ({
  style = null,
  opacity = 0.85,
}: TranslucentViewProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          opacity,
        },
        style,
      ]}
    />
  );
};
