import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { PlacesScreen } from '../screens/PlacesScreen';

export type ServiceStackParamList = {
  Places: undefined;
};

const Stack = createNativeStackNavigator<ServiceStackParamList>();

export const PlacesNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        ...useTitlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Places"
        component={PlacesScreen}
        options={{
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('placesScreen.title'),
        }}
      />
    </Stack.Navigator>
  );
};
