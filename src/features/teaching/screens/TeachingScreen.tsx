import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Badge } from '@lib/ui/components/Badge';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { CourseOverview, ExamStatusEnum } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { usePushNotifications } from '../../../core/hooks/usePushNotifications';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { formatFinalGrade } from '../../../utils/grades';
import { CourseListItem } from '../components/CourseListItem';
import { ExamListItem } from '../components/ExamListItem';
import { ProgressChart } from '../components/ProgressChart';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Home'>;

export const TeachingScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { courses: coursePreferences } = usePreferencesContext();
  const isOffline = useOfflineDisabled();
  const { getUnreadsCount } = usePushNotifications();
  const coursesQuery = useGetCourses();
  const examsQuery = useGetExams();
  const studentQuery = useGetStudent();
  const transcriptBadge = null;

  const courses = useMemo(() => {
    if (!coursesQuery.data) return [];

    return coursesQuery.data
      .filter(
        c =>
          c.uniqueShortcode && !coursePreferences[c.uniqueShortcode]?.isHidden,
      )
      .sort(
        (a: CourseOverview, b) =>
          (coursePreferences[a.id!]?.order ?? 0) -
          (coursePreferences[b.id!]?.order ?? 0),
      );
  }, [coursesQuery, coursePreferences]);

  const exams = useMemo(() => {
    if (!coursesQuery.data || !examsQuery.data) return [];

    const hiddenCourses: string[] = [];

    Object.keys(coursePreferences).forEach((key: string) => {
      if (coursePreferences[key].isHidden) {
        hiddenCourses.push(key);
      }
    });

    return (
      examsQuery.data
        .filter(e => !hiddenCourses.includes(e.uniqueShortcode))
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
      <SafeAreaView style={styles.container}>
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
          <OverviewList
            loading={coursesQuery.isLoading && !isOffline}
            indented
            emptyStateText={(() => {
              if (isOffline) return t('common.cacheMiss');

              return coursesQuery.data?.length ?? 0 > 0
                ? t('teachingScreen.allCoursesHidden')
                : t('coursesScreen.emptyState');
            })()}
          >
            {courses.map(course => (
              <CourseListItem
                key={course.shortcode + '' + course.id}
                course={course}
                badge={getUnreadsCount([
                  // @ts-expect-error TODO fix path typing
                  'teaching',
                  // @ts-expect-error TODO fix path typing
                  'courses',
                  course.id!.toString(),
                ])}
              />
            ))}
          </OverviewList>
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
          <OverviewList
            loading={
              !isOffline && (examsQuery.isLoading || coursesQuery.isLoading)
            }
            indented
            emptyStateText={
              isOffline && examsQuery.isLoading
                ? t('common.cacheMiss')
                : t('examsScreen.emptyState')
            }
          >
            {exams.map(exam => (
              <ExamListItem key={exam.id} exam={exam} />
            ))}
          </OverviewList>
        </Section>
        <Section>
          <SectionHeader title={t('common.transcript')} />

          <View style={GlobalStyles.relative}>
            <Card style={styles.transcriptCard}>
              {studentQuery.isLoading ? (
                isOffline ? (
                  <EmptyState message={t('common.cacheMiss')} />
                ) : (
                  <ActivityIndicator style={styles.loader} />
                )
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
                          title={t(
                            'transcriptScreen.estimatedFinalGradePurged',
                          )}
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
            {transcriptBadge && (
              <Badge text={transcriptBadge} style={styles.badge} />
            )}
          </View>
        </Section>
      </SafeAreaView>
      <BottomBarSpacer />
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      marginVertical: spacing[5],
    },
    loader: {
      marginVertical: spacing[8],
    },
    transcriptCard: {
      marginVertical: spacing[2],
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 10,
    },
  });
