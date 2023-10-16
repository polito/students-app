import { StyleSheet, View, ViewProps } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export interface DividerProps extends ViewProps {
  size?: number;
}

/**
 * A divider element to separate list items
 */
export const Divider = ({
  size = StyleSheet.hairlineWidth,
  style,
  ...props
}: DividerProps) => {
  const { colors } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          minWidth: size,
          minHeight: size,
          backgroundColor: colors.divider,
        },
        style,
      ]}
    ></View>
  );
};
