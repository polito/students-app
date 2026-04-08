import { useTheme } from '@lib/ui/hooks/useTheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FileNavigatorID } from '~/core/constants';

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
    skipInitialDownloadCheck?: boolean;
  };
};

const Stack = createNativeStackNavigator<
  FileStackParamList,
  typeof FileNavigatorID
>();
export const FileNavigator = () => {
  const theme = useTheme();
  const courseId = useCourseContext();
  const { filesScreen } = usePreferencesContext();

  const initialRouteName =
    filesScreen === 'filesView' ? 'RecentFiles' : 'DirectoryFiles';

  return (
    <Stack.Navigator
      id={FileNavigatorID}
      screenOptions={{
        animation: 'none',
        headerShown: false,
        ...useTitlesStyles(theme),
      }}
      initialRouteName={initialRouteName}
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
