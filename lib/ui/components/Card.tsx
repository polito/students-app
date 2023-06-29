import { Platform, View, ViewProps } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export type CardProps = ViewProps & {
  /**
   * Toggles the rounded corners
   */
  rounded?: boolean;

  /**
   * Toggles the inner spacing
   */
  padded?: boolean;

  /**
   * Toggles the outer spacing
   */
  spaced?: boolean;

  /**
   * Toggles the inner spacing
   */
  gapped?: boolean;
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
  gapped = false,
  padded = false,
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
          marginHorizontal: spaced ? spacing[4] : undefined,
          marginVertical: spaced ? spacing[2] : undefined,
          overflow: 'hidden',
        },
        padded
          ? {
              paddingHorizontal: padded ? spacing[5] : undefined,
              paddingVertical: padded ? spacing[2.5] : undefined,
            }
          : {},
        gapped
          ? {
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[2],
            }
          : {},
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
