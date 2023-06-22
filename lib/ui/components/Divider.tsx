import { StyleSheet, View, ViewProps } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export type DividerProps = ViewProps;

/**
 * A divider element to separate list items
 */
export const Divider = ({ style, ...props }: DividerProps) => {
  const { colors } = useTheme();
  return (
    <View
      {...props}
      style={[
        {
          minWidth: StyleSheet.hairlineWidth,
          minHeight: StyleSheet.hairlineWidth,
          backgroundColor: colors.divider,
        },
        style,
      ]}
    ></View>
  );
};
