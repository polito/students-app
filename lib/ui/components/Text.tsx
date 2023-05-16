import { Text as RNText, StyleSheet, TextProps } from 'react-native';

import { useStylesheet } from '../hooks/useStylesheet';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types/Theme';

export interface Props extends TextProps {
  variant?:
    | 'heading'
    | 'subHeading'
    | 'title'
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
  heading: 'semibold',
  subHeading: 'semibold',
  title: 'semibold',
  headline: 'normal',
  caption: 'bold',
  link: 'normal',
  prose: 'normal',
  secondaryText: 'normal',
};

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
}: Props) => {
  const { colors, fontFamilies, fontWeights } = useTheme();
  const styles = useStylesheet(createStyles);
  const fontFamilyName =
    variant === 'heading' ? fontFamilies.heading : fontFamilies.body;
  const textWeight = fontWeights[weight ?? defaultWeights[variant]];

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

const createStyles = ({ fontSizes, spacing }: Theme) =>
  StyleSheet.create({
    heading: {
      fontSize: fontSizes.md,
    },
    subHeading: {
      fontSize: fontSizes.sm,
      textTransform: 'uppercase',
      marginTop: spacing[2],
      marginBottom: spacing[1],
    },
    title: {
      fontSize: fontSizes.xl,
    },
    headline: {
      fontSize: fontSizes.md,
    },
    caption: {
      fontSize: fontSizes.sm,
      textTransform: 'uppercase',
    },
    prose: {},
    secondaryText: {},
    link: {},
  });
