/* eslint-disable @typescript-eslint/naming-convention */
// noinspection AllyPlainJsInspection
//
import { Theme } from '@lib/ui/types/Theme';

import { IS_ANDROID } from '../constants';

const navy = {
  50: '#B7E1FF',
  100: '#9BD6FF',
  200: '#62BFFF',
  300: '#2AA8FF',
  400: '#008EF1',
  500: '#006DB9',
  600: '#004C81',
  700: '#002B49',
  800: '#00223A',
  900: '#00192A',
};

const orange = {
  50: '#FFE8D0',
  100: '#FFDEBC',
  200: '#FFCB93',
  300: '#FFB76A',
  400: '#FFA342',
  500: '#FF8F19',
  600: '#EF7B00',
  700: '#B75E00',
  800: '#7F4100',
  900: '#472400',
};

const gray = {
  50: '#F9FAFB',
  100: '#F3F5F7',
  200: '#E0E6EB',
  300: '#CBD5DC',
  400: '#91A6B6',
  500: '#5C778A',
  600: '#415462',
  700: '#33424D',
  800: '#1F282E',
  900: '#12181C',
};

const rose = {
  50: '#FFF1F2',
  100: '#FFE4E6',
  200: '#FECDD3',
  300: '#FDA4AF',
  400: '#FB7185',
  500: '#F43F5E',
  600: '#E11D48',
  700: '#BE123C',
  800: '#9F1239',
  900: '#881337',
};

const red = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
};

const green = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
};

const darkOrange = {
  50: '#FFF7ED',
  100: '#FFEDD5',
  200: '#FED7AA',
  300: '#FDBA74',
  400: '#FB923C',
  500: '#F97316',
  600: '#EA580C',
  700: '#C2410C',
  800: '#9A3412',
  900: '#7C2D12',
};

const lightBlue = {
  50: '#F0F9FF',
  100: '#E0F2FE',
  200: '#BAE6FD',
  300: '#7DD3FC',
  400: '#38BDF8',
  500: '#0EA5E9',
  600: '#0284C7',
  700: '#0369A1',
  800: '#075985',
  900: '#0C4A6E',
};

const violet = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
};

const backgroundColor = '#F0F3F5';

export const lightTheme: Theme = {
  dark: false,
  colors: {
    touchableHighlight: 'rgba(0, 0, 0, .08)',
    background: backgroundColor,
    surface: '#FFFFFF',
    surfaceDark: '#143959',
    white: '#FFFFFF',
    headersBackground: IS_ANDROID ? '#FFFFFF' : '#EDEEF0',
    heading: navy[700],
    subHeading: lightBlue[700],
    title: navy[700],
    prose: gray[800],
    longProse: gray[800],
    secondaryText: gray[500],
    caption: gray[500],
    link: navy[500],
    divider: gray[300],
    tabBar: navy[200],
    translucentSurface: 'rgba(0, 0, 0, .1)',
    tabBarInactive: gray[500],
    agendaBooking: green[600],
    agendaDeadline: red[700],
    agendaExam: orange[600],
    agendaLecture: navy[500],
  },
  palettes: {
    navy,
    orange,
    gray,
    rose,
    red,
    green,
    darkOrange,
    lightBlue,
    violet,
    text: gray,
    primary: navy,
    secondary: orange,
    danger: rose,
    error: red,
    success: green,
    warning: orange,
    muted: gray,
    info: lightBlue,
  },
  fontFamilies: {
    heading: 'Montserrat',
    body: 'Montserrat',
  },
  fontSizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  shapes: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
  },
  spacing: {
    [0]: 0,
    [0.5]: 2,
    [1]: 4,
    [1.5]: 6,
    [2]: 8,
    [2.5]: 10,
    [3]: 12,
    [3.5]: 14,
    [4]: 16,
    [5]: 18,
    [6]: 24,
    [7]: 28,
    [8]: 32,
    [9]: 36,
    [10]: 40,
    [12]: 48,
    [16]: 64,
    [20]: 80,
    [24]: 96,
    [32]: 128,
    [40]: 160,
    [48]: 192,
    [56]: 224,
    [64]: 256,
    [72]: 288,
    [80]: 320,
    [96]: 384,
  },
  safeAreaInsets: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};
