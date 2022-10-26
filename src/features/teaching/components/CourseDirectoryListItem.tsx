import { TouchableHighlightProps } from 'react-native';

import { DirectoryListItem } from '@lib/ui/components/DirectoryListItem';
import { CourseDirectory } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TeachingStackParamList } from './TeachingNavigator';

interface Props {
  courseId: number;
  item: CourseDirectory;
}

export const CourseDirectoryListItem = ({
  courseId,
  item,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TeachingStackParamList, any>>();
  return (
    <DirectoryListItem
      title={item.name}
      subtitle={`${item.files.length} files`}
      onPress={() =>
        navigation.navigate('CourseDirectory', {
          courseId,
          directoryId: item.id,
        })
      }
      {...rest}
    />
  );
};
