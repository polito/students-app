import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentUpload'
>;

export const CourseAssignmentUploadScreen = ({ route }: Props) => {
  return <View></View>;
};
