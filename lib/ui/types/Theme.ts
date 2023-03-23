/* eslint-disable @typescript-eslint/naming-convention */
import { TextStyle } from 'react-native';

export interface Theme {
  dark: boolean;
  colors: Colors;
  shapes: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacing: {
    [0]: number;
    [0.5]: number;
    [1]: number;
    [1.5]: number;
    [2]: number;
    [2.5]: number;
    [3]: number;
    [3.5]: number;
    [4]: number;
    [5]: number;
    [6]: number;
    [7]: number;
    [8]: number;
    [9]: number;
    [10]: number;
    [12]: number;
    [16]: number;
    [20]: number;
    [24]: number;
    [32]: number;
    [40]: number;
    [48]: number;
    [56]: number;
    [64]: number;
    [72]: number;
    [80]: number;
    [96]: number;
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
    normal: TextStyle['fontWeight'];
    medium?: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
    extrabold?: TextStyle['fontWeight'];
  };
}

export type Colors = Record<string, string | ColorPalette> & {
  background: string;
  surface: string;
  surfaceDark: string;
  headers: string;
  heading: string;
  prose: string;
  headline: string;
  secondaryText: string;
  caption: string;
  link: string;
  divider: string;
  tabBar: string;
  tabBarInactive: string;
  title: string;
  touchableHighlight: string;
  agendaBooking: string;
  agendaDeadline: string;
  agendaExam: string;
  agendaLecture: string;
  translucentSurface: string;
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
