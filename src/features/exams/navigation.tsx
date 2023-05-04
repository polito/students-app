import { ScreenGroupType } from '@core/types/navigation';

import { ExamScreen } from './screens/ExamScreen';
import { ExamsScreen } from './screens/ExamsScreen';

export type ExamsStackParamList = {
  Exams: undefined;
  Exam: { id: number };
};

export const createExamsGroup = <T extends ExamsStackParamList>({
  Stack,
  t,
}: ScreenGroupType<T>) => {
  return (
    <Stack.Group>
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
