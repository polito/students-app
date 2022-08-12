import { Text, View } from 'react-native';
import { useGetStudent } from '../../../core/hooks/studentHooks';
import { useGetGrades } from '../hooks/gradeHooks';

export const GradesScreen = () => {
  const { data: studentResponse } = useGetStudent();
  const { data: gradesResponse, isLoading } = useGetGrades();

  return (
    <View>
      {studentResponse && <Text>{JSON.stringify(studentResponse)}</Text>}
      <View>
        {gradesResponse?.data.map(g => (
          <Text key={g.courseName}>{JSON.stringify(g)}</Text>
        ))}
      </View>
    </View>
  );
};
