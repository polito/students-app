import { PropsWithChildren } from 'react';
import { Platform, View, ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export type Props = PropsWithChildren<
  ViewProps & {
    /**
     * Toggles the rounded corners
     */
    rounded?: boolean;
  }
>;

/**
 * Renders an elevated surface on Android and a
 * flat card on iOS
 */
export const Card = ({ children, style, rounded = true, ...rest }: Props) => {
  const { colors, shapes } = useTheme();
  const shadow =
    Platform.OS === 'android'
      ? {
          elevation: 2,
        }
      : {};

  return (
    <View
      style={[
        {
          borderRadius: rounded ? shapes.lg : undefined,
          backgroundColor: colors.surface,
          ...shadow,
          overflow: Platform.select({
            ios: 'hidden',
          }),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
