import { View } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentUpload'
>;

export const CourseAssignmentUploadScreen = ({ route }: Props) => {
  return (
    <View>
      <Text>Todo upload assignment</Text>
    </View>
  );
};
