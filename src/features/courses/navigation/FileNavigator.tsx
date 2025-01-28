import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useTitlesStyles } from '../../../core/hooks/useTitlesStyles';
import { useCourseContext } from '../contexts/CourseContext';
import { CourseDirectoryScreen } from '../screens/CourseDirectoryScreen';
import { CourseFilesScreen } from '../screens/CourseFilesScreen';

export type FileStackParamList = {
  RecentFiles: {
    courseId: number;
  };
  DirectoryFiles: {
    courseId: number;
    directoryId?: string;
    directoryName?: string;
  };
};

const Stack = createNativeStackNavigator<FileStackParamList>();
export const FileNavigator = () => {
  const theme = useTheme();
  const { filesScreen } = usePreferencesContext();
  const courseId = useCourseContext();

  return (
    <Stack.Navigator
      id="FileTabNavigator"
      screenOptions={{
        headerShown: false,
        ...useTitlesStyles(theme),
      }}
      initialRouteName={
        filesScreen === 'filesView' ? 'RecentFiles' : 'DirectoryFiles'
      }
    >
      <Stack.Screen
        name="RecentFiles"
        component={CourseFilesScreen}
        initialParams={{ courseId: courseId }}
      />
      <Stack.Screen
        name="DirectoryFiles"
        component={CourseDirectoryScreen}
        initialParams={{ courseId: courseId }}
      />
    </Stack.Navigator>
  );
};
