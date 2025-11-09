import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SSOScreen } from '~/core/screens/SSOScreen.tsx';

import { LoginScreen } from '../screens/LoginScreen';

export interface GuestStackParamList extends ParamListBase {
  SSO: undefined;
  Login: undefined;
}

const Stack = createNativeStackNavigator<GuestStackParamList>();

export const GuestNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SSO" component={SSOScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};
