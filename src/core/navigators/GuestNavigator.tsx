import { Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '@lib/ui/components/HeaderLogo';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { Login } from '../screens/Login';

export const GuestNavigator = () => {
  const Stack = createNativeStackNavigator();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerLargeTitle: false,
        headerLargeStyle: { backgroundColor: colors.background },
        headerTransparent: Platform.select({ ios: true }),
        headerBlurEffect: 'systemUltraThinMaterial',
        headerLeft: () => <HeaderLogo />,
        headerTitle: '',
      }}
    >
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
};
