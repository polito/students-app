import { PropsWithChildren, useMemo } from 'react';
import { Text as RNText, StyleSheet, TextProps, TextStyle } from 'react-native';

import { useStylesheet } from '../hooks/useStylesheet';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types/theme';

interface Props {
  variant?:
    | 'heading'
    | 'title'
    | 'headline'
    | 'prose'
    | 'secondaryText'
    | 'caption'
    | 'link';
  weight?: keyof Theme['fontWeights'];
  italic?: boolean;
  capitalize?: boolean;
  uppercase?: boolean;
}

const defaultWeights: { [key: string]: keyof Theme['fontWeights'] } = {
  heading: 'bold',
  title: 'semibold',
  headline: 'normal',
  caption: 'bold',
  link: 'normal',
  prose: 'normal',
  secondaryText: 'normal',
};

export const defaultLineHeightMultiplier = 1.3;

/**
 * A wrapper around RN's Text component that applies basic theme
 * styles
 */
export const Text = ({
  variant = 'prose',
  weight,
  italic = false,
  style,
  capitalize,
  uppercase,
  children,
  ...rest
}: PropsWithChildren<TextProps & Props>) => {
  const { colors, fontFamilies, fontWeights, size } = useTheme();
  const styles = useStylesheet(createStyles);
  const fontFamilyName =
    variant === 'heading' ? fontFamilies.heading : fontFamilies.body;
  const textWeight = fontWeights[weight ?? defaultWeights[variant]];

  // Apply default line height multiplier if only fontSize is provided
  const lineHeight = useMemo(() => {
    const textStyle = style as TextStyle;
    if (textStyle?.lineHeight || !textStyle?.fontSize) return false;
    return textStyle.fontSize * defaultLineHeightMultiplier;
  }, [style]);

  return (
    <RNText
      style={[
        {
          fontFamily: fontFamilyName,
          fontWeight: textWeight,
          color: colors[variant],
        },
        italic && {
          fontStyle: 'italic',
        },
        lineHeight && {
          lineHeight,
        },
        styles[variant],
        capitalize && { textTransform: 'capitalize' },
        uppercase && { textTransform: 'uppercase' },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const createStyles = ({ fontSizes }: Theme) =>
  StyleSheet.create({
    heading: {
      fontSize: fontSizes.xl,
      lineHeight: fontSizes.xl * defaultLineHeightMultiplier,
    },
    title: {
      fontSize: fontSizes.lg,
      lineHeight: fontSizes.lg * defaultLineHeightMultiplier,
    },
    headline: {
      fontSize: fontSizes.md,
      lineHeight: fontSizes.md * defaultLineHeightMultiplier,
    },
    caption: {
      fontSize: fontSizes.xs,
      lineHeight: fontSizes.xs * defaultLineHeightMultiplier,
      textTransform: 'uppercase',
    },
    prose: {},
    secondaryText: {},
    link: {},
  });
