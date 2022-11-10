import { PropsWithChildren, useMemo } from 'react';
import {
  StyleProp,
  TextStyle,
  TouchableHighlightProps,
  TouchableOpacity,
} from 'react-native';

import color from 'color';

import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

export interface Props {
  selected?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * A tab component to be used with Tabs
 */
export const Tab = ({
  children,
  style,
  selected = false,
  textStyle,
  ...rest
}: PropsWithChildren<TouchableHighlightProps & Props>) => {
  const { dark, colors, spacing } = useTheme();
  const backgroundColor = useMemo(
    () =>
      selected
        ? colors.primary[500]
        : color(colors.primary[dark ? 600 : 50])
            .alpha(0.4)
            .toString(),
    [selected, dark, colors],
  );

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityRole="tab"
      accessibilityState={{
        selected,
      }}
      style={[
        {
          backgroundColor,
          borderRadius: 10,
          paddingHorizontal: spacing[2.5],
          paddingVertical: spacing[1],
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          {
            color: selected
              ? colors.text[50]
              : dark
              ? colors.primary[400]
              : colors.primary[500],
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};
