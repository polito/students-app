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
  const { colors, fontFamilies, fontWeights, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const fontFamilyName =
    variant === 'heading' ? fontFamilies.heading : fontFamilies.body;
  const textWeight = fontWeights[weight ?? defaultWeights[variant]];
  const { accessibility } = usePreferencesContext();
  const [styless, setStyless] = useState(styles);

  const calculateValueOfPercentage = (fontSize: number) => {
    return (fontSizes.md * fontSize) / 100;
  };

  const wordSpacing = accessibility?.fontSize
    ? calculateValueOfPercentage(accessibility?.fontSize) * 0.16
    : fontSizes.md;

  const changeStyle = () => {
    setStyless({
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
        letterSpacing:
          accessibility?.fontPlacement === 'long-text'
            ? fontSizes.md * 0.12
            : undefined,
      },
      longProse: {
        fontSize:
          accessibility?.fontSize && accessibility?.fontSize !== 100
            ? calculateValueOfPercentage(accessibility.fontSize)
            : fontSizes.md,
        lineHeight:
          accessibility?.fontSize && accessibility?.lineHeight
            ? calculateValueOfPercentage(accessibility.fontSize) * 1.5
            : undefined,
        letterSpacing:
          accessibility?.fontSize &&
          accessibility?.fontPlacement === 'long-text'
            ? calculateValueOfPercentage(accessibility.fontSize) * 0.12
            : undefined,
        marginBottom:
          accessibility?.fontSize && accessibility?.paragraphSpacing
            ? calculateValueOfPercentage(accessibility.fontSize) * 2
            : 0,
      },
      secondaryText: {},
      link: {},
    } as any);
  };

  const addWordSpacing = (text: string, spacing: number) => {
    return text.split(' ').join(' '.repeat(spacing));
  };

  useEffect(() => {
    changeStyle();
  }, [accessibility]);
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
      // letterSpacing: accessibility?.fontPlacement === 'long-text' ? fontSizes.md * 0.12 : undefined,
    },
    longProse: {
      fontSize: fontSizes.md,
      // lineHeight: accessibility?.lineHeight ? fontSizes.md * 1.5 : undefined,
      // letterSpacing: accessibility?.fontPlacement === 'long-text' ? fontSizes.md * 0.12 : undefined,
      // marginBottom: accessibility?.paragraphSpacing ? fontSizes.md * 2 : 0,
    },
    secondaryText: {},
    link: {},
  });
};
