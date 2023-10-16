import { Platform, View, ViewProps } from 'react-native';

import { IS_IOS } from '../../../src/core/constants';
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

  /**
   * If true, uses a semi-transparent background
   * for use on translucent surfaces
   */
  translucent?: boolean;
};

/**
 * Renders an elevated surface on Android and a
 * flat card on iOS
 */
export const Card = ({
  children,
  style,
  translucent = false,
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
          backgroundColor:
            IS_IOS && translucent ? colors.translucentSurface : colors.surface,
          elevation: 2,
          marginHorizontal: spaced ? spacing[4] : undefined,
          marginVertical: spacing[2],
          overflow: 'hidden',
        },
        padded
          ? {
              paddingHorizontal: padded ? spacing[2.5] : undefined,
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
