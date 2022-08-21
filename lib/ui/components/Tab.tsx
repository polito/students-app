import { PropsWithChildren, useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
} from 'react-native';
import color from 'color';
import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

export interface Props {
  selected?: boolean;
}

/**
 * A tab component to be used with Tabs
 */
export const Tab = ({
  children,
  style,
  selected = false,
  ...rest
}: PropsWithChildren<TouchableHighlightProps & Props>) => {
  const { dark, colors, spacing } = useTheme();
  const backgroundColor = useMemo(
    () =>
      selected
        ? colors.primary[400]
        : color(colors.muted[dark ? 800 : 200])
            .alpha(0.4)
            .toString(),
    [dark, colors],
  );
  const underlayColor = useMemo(
    () =>
      selected
        ? colors.primary[500]
        : color(colors.muted[dark ? 800 : 200])
            .alpha(0.8)
            .toString(),
    [dark, colors],
  );
  const borderColor = useMemo(
    () =>
      color(colors.muted[dark ? 800 : 300])
        .alpha(0.6)
        .toString(),
    [dark, colors],
  );

  return (
    <TouchableHighlight
      accessible={true}
      accessibilityRole="tab"
      accessibilityState={{
        selected,
      }}
      underlayColor={underlayColor}
      style={[
        {
          backgroundColor,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: !selected ? borderColor : backgroundColor,
          borderRadius: 30,
          paddingHorizontal: spacing[2.5],
          paddingVertical: spacing[1],
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={{
          color: selected ? colors.text[50] : colors.secondaryText,
          marginBottom: Platform.select({ android: -3 }),
        }}
      >
        {children}
      </Text>
    </TouchableHighlight>
  );
};
