import { useTranslation } from 'react-i18next';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderLogo } from '../../../core/components/HeaderLogo';
import { titlesStyles } from '../../../core/hooks/titlesStyles';
import { AgendaScreen } from '../screens/AgendaScreen';
import { LectureScreen } from '../screens/LectureScreen';

export type AgendaStackParamList = {
  Agenda: undefined;
  Lecture: { id: number };
};

const Stack = createNativeStackNavigator<AgendaStackParamList>();

export const AgendaNavigator = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        orientation: 'portrait',
        ...titlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          headerLargeTitle: false,
          headerLeft: () => <HeaderLogo />,
          headerTitle: t('agendaScreen.title'),
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Lecture"
        component={LectureScreen}
        options={{
          headerTitle: t('common.lecture'),
        }}
      />
    </Stack.Navigator>
  );
};
