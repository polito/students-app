import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { Card } from '@lib/ui/components/Card';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useNavigation } from '@react-navigation/native';
import color from 'color';
import { useGetStudent } from '../../../core/hooks/studentHooks';
import { useGetCourses } from '../hooks/courseHooks';
import { useGetExams } from '../hooks/examHooks';

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const { navigate } = useNavigation();
  const coursesQuery = useGetCourses();
  const examsQuery = useGetExams();
  const studentQuery = useGetStudent();

  const isLoading =
    coursesQuery.isLoading || examsQuery.isLoading || studentQuery.isLoading;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => {
            coursesQuery.refetch();
            examsQuery.refetch();
            studentQuery.refetch();
          }}
        />
      }
    >
      <View style={styles.sectionsContainer}>
        <Section>
          <SectionHeader title={t('Courses')} linkTo={{ screen: 'Courses' }} />
          <SectionList loading={coursesQuery.isLoading}>
            {coursesQuery.data?.data.slice(0, 4).map(c => (
              <ListItem
                key={c.shortcode}
                linkTo={{
                  screen: 'Course',
                  params: { id: c.id, courseName: c.name },
                }}
                title={c.name}
                subtitle={`${t('Period')} ${c.teachingPeriod}`}
              />
            ))}
          </SectionList>
        </Section>
        <Section>
          <SectionHeader title={t('Exams')} linkTo={{ screen: 'Exams' }} />
          <SectionList loading={examsQuery.isLoading}>
            {examsQuery.data?.data.slice(0, 4).map(e => (
              <ListItem
                key={e.id}
                linkTo={{ screen: 'Exam', params: { id: e.id } }}
                title={e.courseName}
                subtitle={`${e.examStartsAt.toDateString()} - ${e.classrooms}`}
              />
            ))}
          </SectionList>
        </Section>
        <Section>
          <SectionHeader
            title={t('Transcript')}
            linkTo={{ screen: 'Grades' }}
          />

          <TouchableHighlight onPress={() => navigate('Grades')}>
            <Card
              rounded={Platform.select({ android: false })}
              style={styles.card}
            >
              {studentQuery.isLoading ? (
                <ActivityIndicator style={styles.loader} />
              ) : (
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="headline"
                      style={{ marginBottom: spacing[2] }}
                    >
                      {t('Weighted average')}:{' '}
                      {studentQuery.data?.data.averageGrade}
                    </Text>
                    <Text
                      variant="secondaryText"
                      style={{ marginBottom: spacing[2] }}
                    >
                      {t('Final average')}:{' '}
                      {studentQuery.data?.data.averageGradePurged}
                    </Text>
                    <Text variant="secondaryText">
                      {studentQuery.data?.data.totalAcquiredCredits}/
                      {studentQuery.data?.data.totalCredits}{' '}
                      {t('Credits').toLowerCase()}
                    </Text>
                  </View>
                  <ProgressChart
                    data={{
                      labels: ['Test'],
                      data: [
                        studentQuery.data?.data.totalAcquiredCredits /
                          studentQuery.data?.data.totalCredits,
                      ],
                    }}
                    width={90}
                    height={90}
                    hideLegend={true}
                    chartConfig={{
                      backgroundGradientFromOpacity: 0,
                      backgroundGradientToOpacity: 0,
                      color: (opacity = 1) =>
                        color(colors.primary[400]).alpha(opacity).toString(),
                    }}
                  />
                </View>
              )}
            </Card>
          </TouchableHighlight>
        </Section>
      </View>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    sectionsContainer: {
      paddingVertical: spacing[5],
    },
    section: {
      marginBottom: spacing[5],
    },
    loader: {
      marginVertical: spacing[8],
    },
    card: {
      marginVertical: spacing[2],
      marginHorizontal: Platform.select({ ios: spacing[4] }),
      padding: spacing[5],
    },
  });
