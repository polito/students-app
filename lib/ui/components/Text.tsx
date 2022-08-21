import { PropsWithChildren } from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
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
}

const deafultWeights = {
  heading: 'bold',
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
  children,
  ...rest
}: PropsWithChildren<TextProps & Props>) => {
  const { colors, fontFamilies } = useTheme();
  const styles = useStylesheet(createStyles);
  const fontFamilyName =
    variant === 'heading' ? fontFamilies.heading : fontFamilies.body;
  const fontFamily = `${fontFamilyName}-${weight ?? deafultWeights[variant]}${
    italic ? '-italic' : ''
  }`;

  return (
    <RNText
      style={[
        {
          fontFamily,
          color: colors[variant],
        },
        styles[variant],
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
    },
    title: {
      fontSize: fontSizes.lg,
    },
    headline: {
      fontSize: fontSizes.md,
    },
    caption: {
      fontSize: fontSizes.xs,
      textTransform: 'uppercase',
    },
  });
