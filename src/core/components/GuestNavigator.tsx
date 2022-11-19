import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/LoginScreen';
import { HeaderLogo } from './HeaderLogo';

export const GuestNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerLargeTitle: false,
        headerLeft: () => <HeaderLogo />,
        headerTitle: '',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};
