import { useEffect, useState } from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';

import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';
import { useStylesheet } from '../hooks/useStylesheet';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types/Theme';

export interface Props extends TextProps {
  variant?:
    | 'heading'
    | 'subHeading'
    | 'title'
    | 'prose'
    | 'longProse'
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
  longProse: 'normal',
  secondaryText: 'normal',
};
export const calculateValueOfPercentage = (
  fontSize?: number,
  size?: number,
) => {
  return ((size || 16) * (fontSize || 1)) / 100;
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
  const { colors, fontFamilies, fontWeights, fontSizes, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const fontFamilyName =
    variant === 'heading' ? fontFamilies.heading : fontFamilies.body;
  const textWeight = fontWeights[weight ?? defaultWeights[variant]];
  const { accessibility, updatePreference } = usePreferencesContext();
  const [styless, setStyless] = useState(styles);
  const wordSpacing = fontSizes.md * 0.16;

  const addWordSpacing = (text: string, space: number) => {
    if (variant === 'longProse') return text.split(' ').join(' '.repeat(space));
    else return text;
  };

  useEffect(() => {
    if (accessibility?.fontSize === undefined)
      updatePreference('accessibility', {
        ...accessibility,
        fontSize: accessibility?.fontSize ?? 100,
      });
    const getfontStyle = () => {
      if (variant === 'longProse')
        return {
          ...(accessibility?.fontSize && accessibility.fontSize > 100
            ? {
                fontSize: calculateValueOfPercentage(
                  accessibility.fontSize,
                  fontSizes.md,
                ),
              }
            : { fontSize: fontSizes.md }),
          ...(accessibility?.fontSize && accessibility?.lineHeight
            ? {
                lineHeight:
                  calculateValueOfPercentage(
                    accessibility.fontSize,
                    fontSizes.md,
                  ) * 1.5,
              }
            : {}),
          ...(accessibility?.paragraphSpacing && accessibility.fontSize
            ? {
                marginBottom:
                  calculateValueOfPercentage(
                    accessibility.fontSize,
                    fontSizes.md,
                  ) * 2,
              }
            : {}),
        };
    };
    const changeStyle = () => {
      setStyless({
        heading: {
          fontSize: calculateValueOfPercentage(
            accessibility?.fontSize ?? 100,
            fontSizes.md,
          ),
        },
        subHeading: {
          fontSize: calculateValueOfPercentage(
            accessibility?.fontSize ?? 100,
            fontSizes.md,
          ),
          textTransform: 'uppercase',
        },
        title: {
          fontSize: calculateValueOfPercentage(
            accessibility?.fontSize ?? 100,
            fontSizes.xl,
          ),
        },
        headline: {
          fontSize: calculateValueOfPercentage(
            accessibility?.fontSize ?? 100,
            fontSizes.md,
          ),
        },
        caption: {
          fontSize: calculateValueOfPercentage(
            accessibility?.fontSize ?? 100,
            fontSizes.sm,
          ),
          textTransform: 'uppercase',
        },
        prose: {
          fontSize: calculateValueOfPercentage(
            accessibility?.fontSize ?? 100,
            fontSizes.md,
          ),
        },
        longProse: {
          fontSize: fontSizes.md,
          ...getfontStyle(),
        },
      } as any);
    };
    changeStyle();
  }, [accessibility, fontSizes, variant, updatePreference]);
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
        styless[variant],
        capitalize && { textTransform: 'capitalize' },
        uppercase && { textTransform: 'uppercase' },
        style,
        {
          fontSize: calculateValueOfPercentage(
            accessibility?.fontSize ?? 100,
            fontSizes.md,
          ),
        },
        {
          paddingTop:
            accessibility?.fontSize && accessibility.fontSize <= 125
              ? 0
              : spacing[3.5],
        },
      ]}
      {...rest}
    >
      {typeof children === 'string' &&
      variant === 'longProse' &&
      accessibility?.wordSpacing
        ? addWordSpacing(children, wordSpacing)
        : children}
    </RNText>
  );
};

const createStyles = ({ fontSizes }: Theme) => {
  // const { accessibility } = usePreferencesContext()

  return StyleSheet.create({
    heading: {
      fontSize: fontSizes.md,
    },
    subHeading: {
      fontSize: fontSizes.md,
      textTransform: 'uppercase',
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
    prose: {
      fontSize: fontSizes.md,
    },
    longProse: {
      fontSize: fontSizes.md,
    },
    secondaryText: {},
    link: {},
  });
};
