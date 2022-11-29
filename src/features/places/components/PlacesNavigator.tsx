import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { PlacesScreen } from '../screens/PlacesScreen';

export type PlacesStackParamList = {
  Places: {
    placeType?: string;
    placeId?: string;
  };
};

const Stack = createNativeStackNavigator<PlacesStackParamList>();

export const PlacesNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        orientation: 'portrait',
        headerLargeTitle: false,
        headerTransparent: Platform.select({ ios: true }),
        headerBlurEffect: 'systemUltraThinMaterial',
        headerLeft: () => <HeaderLogo />,
        headerBackTitleVisible: true,
        ...titlesStyles(theme),
      }}
    >
      <Stack.Screen name="Places" component={PlacesScreen} />
    </Stack.Navigator>
  );
};
