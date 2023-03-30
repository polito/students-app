import { Platform, View, ViewProps } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export type CardProps = ViewProps & {
  /**
   * Toggles the rounded corners
   */
  rounded?: boolean;

  /**
   * Toggles the outer spacing
   */
  spaced?: boolean;
};

/**
 * Renders an elevated surface on Android and a
 * flat card on iOS
 */
export const Card = ({
  children,
  style,
  spaced = Platform.select({ ios: true, android: false }),
  rounded = Platform.select({ ios: true, android: false }),
  ...rest
}: CardProps) => {
  const { colors, shapes, spacing } = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: rounded ? shapes.lg : undefined,
          backgroundColor: colors.surface,
          elevation: 2,
          marginHorizontal: spaced ? spacing[5] : undefined,
          marginVertical: spaced ? spacing[2] : undefined,
          overflow: 'hidden',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
