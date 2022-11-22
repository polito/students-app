import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../hooks/useTheme';

interface Prop {
  style?: StyleProp<ViewStyle>;
}

/**
 * A divider element to separate list items
 */
export const Divider = ({ style = {} }: Prop) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          // flex: 1,
          minWidth: StyleSheet.hairlineWidth,
          minHeight: StyleSheet.hairlineWidth,
          backgroundColor: colors.divider,
        },
        style,
      ]}
    ></View>
  );
};
