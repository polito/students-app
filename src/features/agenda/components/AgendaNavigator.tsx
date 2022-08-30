import { useTranslation } from 'react-i18next';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgendaScreen } from '../screens/AgendaScreen';
import { LectureScreen } from '../screens/LectureScreen';

const Stack = createNativeStackNavigator();

export const AgendaNavigator = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          headerTitle: t('Agenda'),
          headerLargeStyle: {
            backgroundColor: colors.surface,
          },
          headerTransparent: false,
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
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
