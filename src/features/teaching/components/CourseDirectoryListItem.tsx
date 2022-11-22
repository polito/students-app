import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <DirectoryListItem
      title={item.name}
      subtitle={t('courseDirectoryListItem.subtitle', {
        count: item.files.length,
      })}
      onPress={() =>
        navigation.navigate('CourseDirectory', {
          courseId,
          directoryId: item.id,
          directoryName: item.name,
        })
      }
      {...rest}
    />
  );
};
