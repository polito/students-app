import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { ExamStatusEnum } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { IS_IOS } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { useGetSurveyCategories } from '../../../core/queries/surveysHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { formatFinalGrade, formatThirtiethsGrade } from '../../../utils/grades';
import { CourseListItem } from '../../courses/components/CourseListItem';
import { isCourseDetailed } from '../../courses/utils/courses';
import { ExamListItem } from '../components/ExamListItem';
import { ProgressChart } from '../components/ProgressChart';
import { SurveyTypesSection } from '../components/SurveyTypesSection';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Home'>;

export const TeachingScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const {
    courses: coursePreferences,
    hideGrades,
    updatePreference,
  } = usePreferencesContext();
  const isOffline = useOfflineDisabled();
  const { getUnreadsCountPerCourse } = useNotifications();
  const surveyCategoriesQuery = useGetSurveyCategories();
  const coursesQuery = useGetCourses();
  const examsQuery = useGetExams();
  const studentQuery = useGetStudent();
  const { accessibilityListLabel } = useAccessibility();

  const transcriptBadge = null;

  const courses = useMemo(() => {
    if (!coursesQuery.data) return [];

    return coursesQuery.data.filter(
      c =>
        isCourseDetailed(c) &&
        c.uniqueShortcode &&
        !coursePreferences[c.uniqueShortcode]?.isHidden,
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
        .filter(
          e =>
            !hiddenCourses.includes(e.uniqueShortcode) &&
            e.examEndsAt!.valueOf() > DateTime.now().toJSDate().valueOf(),
        )
        .sort((a, b) => {
          const status =
            (a.status === ExamStatusEnum.Booked ? -1 : 0) +
            (b.status === ExamStatusEnum.Booked ? 1 : 0);
          return status !== 0
            ? status
            : a.examStartsAt!.valueOf() - b.examStartsAt!.valueOf();
        })
        .slice(0, 4) ?? []
    );
  }, [coursePreferences, coursesQuery.data, examsQuery.data]);

  const transcriptAccessibleLabel = useMemo(() => {
    if (hideGrades) {
      return [
        t('transcriptMetricsScreen.notShown'),
        t('transcriptMetricsScreen.showDetails'),
      ].join('. ');
    }

    const firstLabel =
      studentQuery.data?.averageGradePurged != null
        ? t('transcriptMetricsScreen.finalAverageLabel')
        : t('transcriptMetricsScreen.weightedAverageLabel');
    const firstLabelValue = hideGrades
      ? t('common.notAvailable')
      : (studentQuery.data?.averageGradePurged ??
        studentQuery.data?.averageGrade ??
        t('common.notAvailable'));

    const secondLabel = studentQuery.data?.estimatedFinalGradePurged
      ? t('transcriptMetricsScreen.estimatedFinalGradePurged')
      : t('transcriptMetricsScreen.estimatedFinalGrade');
    const secondPreValue = studentQuery.data?.estimatedFinalGradePurged
      ? studentQuery.data?.estimatedFinalGradePurged || 0
      : studentQuery.data?.estimatedFinalGrade || 0;
    const secondLabelValue = `${secondPreValue} ${t('common.on')} 110`;

    const thirdLabel = t('transcriptMetricsScreen.totalCredits');
    const thirdLabelValue = `${studentQuery.data?.totalAcquiredCredits} ${t(
      'common.on',
    )} ${studentQuery.data?.totalCredits}`;

    return [
      firstLabel,
      firstLabelValue,
      secondLabel,
      secondLabelValue,
      thirdLabel,
      thirdLabelValue,
      t('transcriptMetricsScreen.showDetails'),
    ].join('. ');
  }, [
    hideGrades,
    studentQuery.data?.averageGrade,
    studentQuery.data?.averageGradePurged,
    studentQuery.data?.estimatedFinalGrade,
    studentQuery.data?.estimatedFinalGradePurged,
    studentQuery.data?.totalAcquiredCredits,
    studentQuery.data?.totalCredits,
    t,
  ]);

  const coursesSectionLabelAccessible = useMemo(() => {
    const notVisibleCourseCount = coursesQuery?.data?.length
      ? coursesQuery?.data?.length - courses.length
      : 0;
    const notVisibleCourseCountLabel =
      notVisibleCourseCount > 0
        ? t('coursesScreen.totalNotVisible', {
            total: notVisibleCourseCount,
          })
        : undefined;

    return [
      t('coursesScreen.title'),
      t('coursesScreen.total', { total: courses.length }),
      `  ${t('common.and')} ${notVisibleCourseCountLabel} `,
    ].join('. ');
  }, [courses.length, coursesQuery?.data?.length, t]);

  const examsSectionLabelAccessible = useMemo(() => {
    const notVisibleExamCount = examsQuery?.data?.length
      ? examsQuery?.data?.length - exams.length
      : 0;
    const notVisibleExamCountLabel =
      notVisibleExamCount > 0
        ? t('examsScreen.totalNotVisible', {
            total: notVisibleExamCount,
          })
        : undefined;
    return [
      t('examsScreen.title'),
      t('examsScreen.total', { total: exams.length }),
      `  ${t('common.and')} ${notVisibleExamCountLabel} `,
    ].join('. ');
  }, [exams.length, examsQuery?.data?.length, t]);

  const onHide = (value: boolean) => {
    updatePreference('hideGrades', value);
    const message = value
      ? 'coursesScreen.hiddenCredits'
      : 'coursesScreen.visibleCredits';
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(t(message));
    }, 500);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          queries={[
            coursesQuery,
            examsQuery,
            studentQuery,
            surveyCategoriesQuery,
          ]}
          manual
        />
      }
    >
      <View style={styles.container}>
        {surveyCategoriesQuery.data?.length ? (
          <SurveyTypesSection types={surveyCategoriesQuery.data} />
        ) : undefined}
        <Section>
          <SectionHeader
            accessible
            accessibilityLabel={coursesSectionLabelAccessible}
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

              return (coursesQuery.data?.length ?? 0 > 0)
                ? t('teachingScreen.allCoursesHidden')
                : t('coursesScreen.emptyState');
            })()}
          >
            {courses.map(course => (
              <CourseListItem
                key={course.shortcode + '' + course.id}
                course={course}
                badge={getUnreadsCountPerCourse(
                  course.id,
                  course.previousEditions,
                )}
              />
            ))}
          </OverviewList>
        </Section>
        <Section>
          <SectionHeader
            accessible
            accessibilityLabel={examsSectionLabelAccessible}
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
            {exams.map((exam, index) => (
              <ExamListItem
                key={`${exam.id}` + exam.moduleNumber}
                exam={exam}
                bottomBorder={index < exams.length - 1}
                accessible={true}
                accessibilityLabel={accessibilityListLabel(index, exams.length)}
              />
            ))}
          </OverviewList>
        </Section>
        <Section>
          {/*/ / this Pressable is for ios accessibility*/}
          <Pressable onPress={() => IS_IOS && onHide(!hideGrades)}>
            <SectionHeader
              title={t('common.transcript')}
              trailingItem={<HideGrades />}
            />
          </Pressable>

          <View style={GlobalStyles.relative}>
            <Card style={styles.transcriptCard}>
              {studentQuery.isLoading ? (
                isOffline ? (
                  <OverviewList emptyStateText={t('common.cacheMiss')} />
                ) : (
                  <ActivityIndicator style={styles.loader} />
                )
              ) : (
                <TouchableHighlight
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={transcriptAccessibleLabel}
                  onPress={() => navigation.navigate('Transcript')}
                  underlayColor={colors.touchableHighlight}
                >
                  <Row p={5} gap={5} align="center" justify="space-between">
                    <Col justify="center" flexShrink={1} gap={5}>
                      <Metric
                        title={t('transcriptMetricsScreen.weightedAverage')}
                        value={formatThirtiethsGrade(
                          !hideGrades ? studentQuery.data?.averageGrade : null,
                        )}
                        color={colors.title}
                      />
                      <Metric
                        title={t('transcriptMetricsScreen.averageLabel')}
                        value={formatFinalGrade(
                          !hideGrades
                            ? studentQuery.data?.usePurgedAverageFinalGrade
                              ? studentQuery.data?.estimatedFinalGradePurged
                              : studentQuery.data?.estimatedFinalGrade
                            : null,
                        )}
                        color={colors.title}
                      />
                    </Col>
                    <Col style={styles.graph} flexShrink={1}>
                      <View style={{ alignItems: 'center' }}>
                        <ProgressChart
                          label={
                            studentQuery.data?.totalCredits
                              ? `${
                                  hideGrades
                                    ? '--'
                                    : studentQuery.data?.totalAcquiredCredits
                                }/${studentQuery.data?.totalCredits}\n${t(
                                  'common.ects',
                                )}`
                              : undefined
                          }
                          data={
                            hideGrades
                              ? []
                              : studentQuery.data?.totalCredits
                                ? [
                                    (studentQuery.data?.totalAttendedCredits ??
                                      0) / studentQuery.data?.totalCredits,
                                    (studentQuery.data?.totalAcquiredCredits ??
                                      0) / studentQuery.data?.totalCredits,
                                  ]
                                : []
                          }
                          boxSize={140}
                          radius={40}
                          thickness={18}
                          colors={[
                            palettes.primary[400],
                            palettes.secondary[500],
                          ]}
                        />
                      </View>
                    </Col>
                  </Row>
                </TouchableHighlight>
              )}
            </Card>
            {transcriptBadge && (
              <UnreadBadge text={transcriptBadge} style={styles.badge} />
            )}
          </View>
        </Section>
      </View>
      <BottomBarSpacer />
    </ScrollView>
  );
};

const HideGrades = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { hideGrades, updatePreference } = usePreferencesContext();

  const label = hideGrades ? t('common.show') : t('common.hide');
  const icon = hideGrades ? faEye : faEyeSlash;

  const onHide = (value: boolean) => {
    updatePreference('hideGrades', value);
    const message = value
      ? 'coursesScreen.hiddenCredits'
      : 'coursesScreen.visibleCredits';
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(t(message));
    }, 500);
  };

  return (
    <View
      style={styles.hideGradesSwitch}
      accessibilityLabel={`${label}, ${t(
        'transcriptMetricsScreen.hideAndShowButton',
      )} `}
      accessibilityRole="button"
      accessible
    >
      <Icon icon={icon} color={colors.link} />
      <Text variant="link" onPress={() => onHide(!hideGrades)}>
        {label}
      </Text>
    </View>
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
    hideGradesSwitch: {
      display: 'flex',
      flexDirection: 'row',
      gap: spacing[1],
      alignItems: 'center',
    },
    graph: {
      paddingHorizontal: spacing[4],
    },
  });
