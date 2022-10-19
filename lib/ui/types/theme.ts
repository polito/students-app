import { TextStyle } from 'react-native';

export interface Theme {
  dark: boolean;
  colors: Colors;
  shapes: {
    sm: number;
    md: number;
    lg: number;
  };
  spacing: {
    px: string | number;
    '0': string | number;
    '0.5': string | number;
    '1': string | number;
    '1.5': string | number;
    '2': number | string;
    '2.5': string | number;
    '3': string | number;
    '3.5': string | number;
    '4': string | number;
    '5': string | number;
    '6': string | number;
    '7': string | number;
    '8': string | number;
    '9': string | number;
    '10': string | number;
    '12': string | number;
    '16': string | number;
    '20': string | number;
    '24': string | number;
    '32': string | number;
    '40': string | number;
    '48': string | number;
    '56': string | number;
    '64': string | number;
    '72': string | number;
    '80': string | number;
    '96': string | number;
  };
  size: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSizes: {
    '2xs': number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
    '6xl': number;
    '7xl': number;
    '8xl': number;
    '9xl': number;
  };
  fontFamilies: {
    heading: string;
    body: string;
  };
  fontWeights: {
    hairline?: TextStyle['fontWeight'];
    thin?: TextStyle['fontWeight'];
    light?: TextStyle['fontWeight'];
    normal: TextStyle['fontWeight'];
    medium?: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
    extrabold?: TextStyle['fontWeight'];
    black?: TextStyle['fontWeight'];
  };
}

export type Colors = Record<string, string | ColorPalette> & {
  background: string;
  surface: string;
  heading: string;
  title: string;
  prose: string;
  headline: string;
  secondaryText: string;
  caption: string;
  link: string;
  divider: string;
  touchableHighlight: string;
  text: ColorPalette;
  primary: ColorPalette;
  secondary: ColorPalette;
  danger: ColorPalette;
  success: ColorPalette;
  error: ColorPalette;
  warning: ColorPalette;
  muted: ColorPalette;
  info: ColorPalette;
};

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}
