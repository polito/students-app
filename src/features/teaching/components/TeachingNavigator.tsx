import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourseScreen } from '../screens/CourseScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { ExamScreen } from '../screens/ExamScreen';
import { ExamsScreen } from '../screens/ExamsScreen';
import { GradesScreen } from '../screens/GradesScreen';
import { HomeScreen } from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export const TeachingNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          headerTitle: 'Corsi',
        }}
      />
      <Stack.Screen name="Course" component={CourseScreen} />
      <Stack.Screen
        name="Exams"
        component={ExamsScreen}
        options={{
          headerTitle: 'Appelli',
        }}
      />
      <Stack.Screen name="Exam" component={ExamScreen} />
      <Stack.Screen
        name="Grades"
        component={GradesScreen}
        options={{
          headerTitle: 'Libretto',
        }}
      />
    </Stack.Navigator>
  );
};
