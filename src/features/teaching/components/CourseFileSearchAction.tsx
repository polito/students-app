import { TouchableHighlight } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TeachingStackParamList } from './TeachingNavigator';

export const CourseFileSearchAction = () => {
  const {
    params: { courseId },
  } =
    useRoute<
      RouteProp<
        TeachingStackParamList,
        'CourseDirectory' | 'CourseDirectoryRoot'
      >
    >();
  const { navigate } =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();

  const { colors, spacing } = useTheme();

  return (
    <TouchableHighlight
      underlayColor={colors.touchableHighlight}
      style={{ padding: spacing[3] }}
      onPress={() =>
        navigate('CourseDirectorySearch', {
          courseId,
        })
      }
    >
      <Ionicons name="search" size={20} />
    </TouchableHighlight>
  );
};
