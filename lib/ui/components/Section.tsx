import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

export const Section = ({
  style,
  children,
  ...rest
}: PropsWithChildren<ViewProps>) => {
  const { spacing } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'column',
          marginBottom: spacing[5],
        },
        style,
      ]}
      accessible={true}
      {...rest}
    >
      {children}
    </View>
  );
};
