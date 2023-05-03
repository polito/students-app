/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { titlesStyles } from '@core/hooks/titlesStyles';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { ExamScreen } from './ExamScreen';
import { ExamsScreen } from './ExamsScreen';

export type ExamsStackParamList = {
  Exams: undefined;
  Exam: { id: number };
};

export const createExamsScreens = <T extends ExamsStackParamList>({
  Stack,
}: {
  Stack: ReturnType<typeof createNativeStackNavigator<T>>;
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <Stack.Group
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: Platform.select({ ios: true }),
        headerLargeStyle: {
          backgroundColor: colors.background,
        },
        ...titlesStyles(theme),
      }}
    >
      <Stack.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          headerTitle: t('common.examCall_plural'),
        }}
      />
      <Stack.Screen
        name="Exam"
        component={ExamScreen}
        options={{
          headerLargeTitle: false,
          headerTitle: t('common.examCall'),
        }}
      />
    </Stack.Group>
  );
};
