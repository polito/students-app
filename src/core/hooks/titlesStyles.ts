import { Theme } from '@lib/ui/types/theme';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const titlesStyles: (
  theme: Theme,
) => Partial<NativeStackNavigationOptions> = ({
  colors,
  fontFamilies,
  fontWeights,
}) => ({
  headerTitleStyle: {
    fontFamily: fontFamilies.heading,
    fontWeight: fontWeights.semibold,
    color: colors.heading,
  },
  headerLargeTitleStyle: {
    fontFamily: fontFamilies.heading,
    fontWeight: fontWeights.semibold,
    color: colors.heading,
  },
  headerBackTitleStyle: {
    fontFamily: fontFamilies.heading,
  },
});
