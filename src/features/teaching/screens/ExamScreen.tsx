import { Text, View } from 'react-native';
import { ExamStatusEnum } from '@polito-it/api-client/models/Exam';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { useBookExam, useGetExams } from '../hooks/ExamHooks';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Exam'>;

export const ExamScreen = ({ route }: Props) => {
  const { id } = route.params;

  const { data: examsResponse } = useGetExams();

  const exam = examsResponse?.data.find(e => e.id === id);
  const bookExamMutation = useBookExam(exam.id);

  return (
    <View>
      <Text>{JSON.stringify(exam)}</Text>

      {exam.status === ExamStatusEnum.Available && bookExamMutation.isIdle && (
        <View onTouchStart={() => bookExamMutation.mutate({})}>
          <Text>Book</Text>
        </View>
      )}
      {bookExamMutation.isSuccess && <Text>Exam booked!</Text>}
    </View>
  );
};
