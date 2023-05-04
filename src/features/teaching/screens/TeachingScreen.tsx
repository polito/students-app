import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableHighlight, View } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Metric } from '@lib/ui/components/Metric';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { CourseOverview, ExamStatusEnum } from '@polito/api-client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { formatFinalGrade } from '../../../utils/grades';
import { CourseListItem } from '../components/CourseListItem';
import { ExamListItem } from '../components/ExamListItem';
import { ProgressChart } from '../components/ProgressChart';
import { TeachingStackParamList } from '../components/TeachingNavigator';

interface Props {
  navigation: NativeStackNavigationProp<TeachingStackParamList, 'Home'>;
}

export const TeachingScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { courses: coursePreferences } = usePreferencesContext();
  const coursesQuery = useGetCourses();
  const examsQuery = useGetExams();
  const studentQuery = useGetStudent();

  useEffect(() => {
    throw new Error('My first Sentry error!');
  }, []);

  const courses = useMemo(() => {
    if (!coursesQuery.data) return [];

    return coursesQuery.data
      .filter(c => c.id && !coursePreferences[c.id]?.isHidden)
      .sort(
        (a: CourseOverview, b) =>
          (coursePreferences[a.id!]?.order ?? 0) -
          (coursePreferences[b.id!]?.order ?? 0),
      );
  }, [coursesQuery, coursePreferences]);

  const exams = useMemo(() => {
    if (!coursesQuery.data || !examsQuery.data) return [];

    const hiddenNonModuleCourses: string[] = [];

    Object.keys(coursePreferences).forEach((key: string) => {
      if (coursePreferences[+key].isHidden) {
        const hiddenCourse = coursesQuery.data?.find(c => c.id === +key);
        if (hiddenCourse && !hiddenCourse.isModule)
          hiddenNonModuleCourses.push(hiddenCourse.shortcode);
      }
    });

    return (
      examsQuery.data
        .filter(e => !hiddenNonModuleCourses.includes(e.courseShortcode))
        .sort(e => (e.status === ExamStatusEnum.Booked ? -1 : 1))
        .slice(0, 4) ?? []
    );
  }, [coursePreferences, coursesQuery.data, examsQuery.data]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          queries={[coursesQuery, examsQuery, studentQuery]}
          manual
        />
      }
    >
      <View style={styles.container}>
        <Section>
          <SectionHeader
            title={t('coursesScreen.title')}
            linkTo={{ screen: 'Courses' }}
            linkToMoreCount={
              coursesQuery.data
                ? coursesQuery.data.length - courses.length
                : undefined
            }
          />
          <SectionList
            loading={coursesQuery.isLoading}
            indented
            emptyStateText={
              coursesQuery.data?.length ?? 0 > 0
                ? t('teachingScreen.allCoursesHidden')
                : t('coursesScreen.emptyState')
            }
          >
            {courses.map(course => (
              <CourseListItem
                key={course.shortcode + '' + course.id}
                course={course}
              />
            ))}
          </SectionList>
        </Section>
        <Section>
          <SectionHeader
            title={t('examsScreen.title')}
            linkTo={{ screen: 'Exams' }}
            linkToMoreCount={
              examsQuery.data
                ? examsQuery.data.length - exams.length
                : undefined
            }
          />
          <SectionList
            loading={examsQuery.isLoading}
            indented
            emptyStateText={t('examsScreen.emptyState')}
          >
            {exams.map(exam => (
              <ExamListItem key={exam.id} exam={exam} />
            ))}
          </SectionList>
        </Section>
        <Section>
          <SectionHeader title={t('common.transcript')} />

          <Card style={styles.sectionContent}>
            {studentQuery.isLoading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              <TouchableHighlight
                onPress={() => navigation.navigate('Transcript')}
                underlayColor={colors.touchableHighlight}
              >
                <Row p={5} gap={5} align="stretch" justify="space-between">
                  <Col justify="space-between">
                    <Metric
                      title={
                        studentQuery.data?.averageGradePurged != null
                          ? t('transcriptScreen.finalAverageLabel')
                          : t('transcriptScreen.weightedAverageLabel')
                      }
                      value={
                        studentQuery.data?.averageGradePurged ??
                        studentQuery.data?.averageGrade ??
                        '--'
                      }
                      color={colors.title}
                    />
                    {studentQuery.data?.estimatedFinalGradePurged ? (
                      <Metric
                        title={t('transcriptScreen.estimatedFinalGradePurged')}
                        value={formatFinalGrade(
                          studentQuery.data?.estimatedFinalGradePurged,
                        )}
                        color={colors.title}
                      />
                    ) : (
                      <Metric
                        title={t('transcriptScreen.estimatedFinalGrade')}
                        value={formatFinalGrade(
                          studentQuery.data?.estimatedFinalGrade,
                        )}
                        color={colors.title}
                      />
                    )}
                  </Col>
                  <ProgressChart
                    label={
                      studentQuery.data?.totalCredits
                        ? `${studentQuery.data?.totalAcquiredCredits}/${
                            studentQuery.data?.totalCredits
                          }\n${t('common.ects')}`
                        : undefined
                    }
                    data={
                      studentQuery.data && studentQuery.data.totalCredits
                        ? [
                            (studentQuery.data?.totalAttendedCredits ?? 0) /
                              studentQuery.data?.totalCredits,
                            (studentQuery.data?.totalAcquiredCredits ?? 0) /
                              studentQuery.data?.totalCredits,
                          ]
                        : []
                    }
                    boxSize={140}
                    radius={40}
                    thickness={18}
                    colors={[palettes.primary[400], palettes.secondary[500]]}
                  />
                </Row>
              </TouchableHighlight>
            )}
          </Card>
        </Section>
      </View>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
    loader: {
      marginVertical: spacing[8],
    },
    sectionContent: {
      marginVertical: spacing[2],
    },
  });
