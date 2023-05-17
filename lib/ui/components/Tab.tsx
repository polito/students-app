import { useMemo } from 'react';
import { TextProps } from 'react-native';

import { PillButton, PillButtonProps } from '@lib/ui/components/PillButton';

import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

export interface Props extends PillButtonProps {
  selected?: boolean;
  textStyle?: TextProps['style'];
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
}: Props) => {
  const { dark, palettes, spacing, fontWeights } = useTheme();
  const backgroundColor = useMemo(
    () =>
      selected ? palettes.primary[500] : palettes.primary[dark ? 600 : 50],
    [selected, dark, palettes],
  );

  return (
    <PillButton
      accessibilityRole="tab"
      accessible={true}
      accessibilityState={{
        selected,
      }}
      style={[
        {
          backgroundColor,
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
    </PillButton>
  );
};
