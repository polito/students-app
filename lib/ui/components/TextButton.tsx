import { PropsWithChildren } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const TextButton = ({
  children,
  style,
  ...rest
}: PropsWithChildren<TouchableOpacityProps>) => {
  const { colors, spacing, fontWeights } = useTheme();
  return (
    <TouchableOpacity
      style={[
        {
          padding: spacing[2],
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={{
          color: colors.primary[400],
          fontWeight: fontWeights.semibold,
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};
