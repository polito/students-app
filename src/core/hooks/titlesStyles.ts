import { Platform } from 'react-native';

import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { Theme } from '@lib/ui/types/Theme';

export const titlesStyles: (
  theme: Theme,
) => Partial<NativeStackNavigationOptions> = ({
  dark,
  colors,
  fontFamilies,
  fontWeights,
}) => ({
  headerTitleStyle: {
    fontFamily: fontFamilies.heading,
    fontSize: Platform.select({ android: 20, ios: 17 }),
    fontWeight: fontWeights.semibold,
    color: colors.title,
  },
  headerLargeTitleStyle: {
    fontFamily: fontFamilies.heading,
    fontWeight: fontWeights.semibold,
    color: colors.title,
  },
  headerBackTitleStyle: {
    fontFamily: fontFamilies.heading,
  },
  headerBlurEffect: dark
    ? 'systemUltraThinMaterialDark'
    : 'systemUltraThinMaterialLight',
});
