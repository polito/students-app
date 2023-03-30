import { StyleSheet, View, ViewProps } from 'react-native';

import { useTheme } from '../hooks/useTheme';

/**
 * A divider element to separate list items
 */
export const Divider = ({ style, ...props }: ViewProps) => {
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
