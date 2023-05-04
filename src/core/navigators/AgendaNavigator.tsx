import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  AgendaStackParamList,
  createAgendaStackGroup,
} from '@features/agenda/navigation';

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export const AgendaNavigator = () => {
  const group = createAgendaStackGroup(Stack);
  return <Stack.Navigator>{group}</Stack.Navigator>;
};
