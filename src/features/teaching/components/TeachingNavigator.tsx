import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourseScreen } from '../screens/CourseScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { GradesScreen } from '../screens/GradesScreen';
import { HomeScreen } from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export const TeachingNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: t('Teaching'),
        }}
      />
      <Stack.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          headerTitle: t('Courses'),
        }}
      />
      <Stack.Screen name="Course" component={CourseScreen} />
      <Stack.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          headerTitle: t('Exams'),
        }}
      />
      <Stack.Screen name="Exam" component={ExamScreen} />
      <Stack.Screen
        name="Grades"
        component={GradesScreen}
        options={{
          headerTitle: t('Transcript'),
        }}
      />
    </Stack.Navigator>
  );
};
