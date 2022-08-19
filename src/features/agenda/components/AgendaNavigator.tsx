import { useTranslation } from 'react-i18next';
import { createStackNavigator } from '@react-navigation/stack';
import { AgendaScreen } from '../screens/AgendaScreen';
import { LectureScreen } from '../screens/LectureScreen';

const Stack = createStackNavigator();

export const AgendaNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          headerTitle: t('Agenda'),
        }}
      />
      <Stack.Screen
        name="Lecture"
        component={LectureScreen}
        options={{
          headerTitle: t('Lecture'),
        }}
      />
    </Stack.Navigator>
  );
};
