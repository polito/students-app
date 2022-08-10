import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from '@react-navigation/native';
import { SectionHeader } from '../../../core/components/SectionHeader';
import { useGetStudent } from '../../../core/hooks/StudentHooks';
import { useGetCourses } from '../hooks/CourseHooks';
import { useGetExams } from '../hooks/ExamHooks';

export const HomeScreen = () => {
  const { t } = useTranslation();

  const { data: coursesResponse, isLoading: isCoursesLoading } =
    useGetCourses();
  const { data: examsResponse } = useGetExams();
  const { data: studentResponse } = useGetStudent();
  return (
    <View>
      <View style={styles.sectionsContainer}>
        <View style={styles.section}>
          <SectionHeader title={t('Courses')} linkTo={{ screen: 'Courses' }} />
          {isCoursesLoading && <Text>Loading</Text>}
          <View>
            {coursesResponse?.data.slice(0, 4).map(c => (
              <Link key={c.id} to={{ screen: 'Course', params: { id: c.id } }}>
                <Text>{JSON.stringify(c)}</Text>
              </Link>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader title={t('Exams')} linkTo={{ screen: 'Exams' }} />
          <View>
            {examsResponse?.data.slice(0, 4).map(e => (
              <Link key={e.id} to={{ screen: 'Exam', params: { id: e.id } }}>
                <Text>{JSON.stringify(e)}</Text>
              </Link>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader
            title={t('Transcript')}
            linkTo={{ screen: 'Grades' }}
          />
          {studentResponse && (
            <Link to={{ screen: 'Grades' }}>
              <Text>{JSON.stringify(studentResponse.data)}</Text>
            </Link>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionsContainer: {
    display: 'flex',
    paddingVertical: 18,
  },
  section: {
    marginBottom: 24,
  },
});
