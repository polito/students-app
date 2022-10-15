import { Colors } from '@lib/ui/types/theme';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const titlesStyles: (
  colors: Colors,
) => Partial<NativeStackNavigationOptions> = colors => ({
  headerTitleStyle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: colors.heading,
  },
  headerLargeTitleStyle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: colors.heading,
  },
  headerBackTitleStyle: {
    fontFamily: 'Poppins',
  },
});
