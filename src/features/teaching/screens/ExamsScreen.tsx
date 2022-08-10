import { Text, View } from 'react-native';
import { Link } from '@react-navigation/native';
import { useGetExams } from '../hooks/ExamHooks';

export const ExamsScreen = () => {
  const { data: examsResponse, isLoading } = useGetExams();

  return (
    <View>
      {isLoading && <Text>Loading</Text>}
      <Text>Exams</Text>
      <View>
        {examsResponse?.data.map(e => (
          <Link key={e.id} to={{ screen: 'Exam', params: { id: e.id } }}>
            <Text>{JSON.stringify(e)}</Text>
          </Link>
        ))}
      </View>
    </View>
  );
};
