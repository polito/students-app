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
  const { dark, palettes, spacing, fontWeights } = useTheme();
  const backgroundColor = useMemo(
    () =>
      selected
        ? palettes.primary[500]
        : color(palettes.primary[dark ? 600 : 50])
            .alpha(0.4)
            .toString(),
    [selected, dark, palettes],
  );

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessible={true}
      accessibilityState={{
        selected,
      }}
      style={[
        {
          backgroundColor,
          borderRadius: 10,
          paddingHorizontal: spacing[2.5],
          paddingVertical: spacing[1.5],
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          {
            color: selected
              ? palettes.text[50]
              : dark
              ? palettes.primary[400]
              : palettes.primary[500],
            fontWeight: fontWeights.medium,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};
