import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  AgendaStackParamList,
  createAgendaScreens,
} from '../../features/agenda/screens/createAgendaScreens';

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export const AgendaNavigator = () => {
  const group = createAgendaScreens({ Stack });
  return <Stack.Navigator>{group}</Stack.Navigator>;
};
