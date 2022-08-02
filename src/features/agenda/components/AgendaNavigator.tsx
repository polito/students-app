import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgendaScreen } from '../screens/AgendaScreen';

const Stack = createNativeStackNavigator();

export const AgendaNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={AgendaScreen}
        options={{
          headerTitle: t('Agenda'),
        }}
      />
    </Stack.Navigator>
  );
};
