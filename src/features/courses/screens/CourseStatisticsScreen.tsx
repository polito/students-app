import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetCourseStatistics } from '../../../core/queries/offeringHooks';
import { SharedScreensParamList } from '../../../shared/navigation/SharedScreens';
import {
  CourseGradesChart,
  EnrolledExamChart,
  EnrolledExamDetailChart,
} from '../components/CourseChart';
import { CourseStatisticsBottomSheets } from '../components/CourseStatisticsBottomSheets';
import { CourseStatisticsFilters } from '../components/CourseStatisticsFilters';
import { computeStatisticsFilters } from '../utils/computeStatisticsFilters';

type Props = NativeStackScreenProps<SharedScreensParamList, 'CourseStatistics'>;
export const CourseStatisticsScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { courseShortcode: shortCode, year, teacherId } = route.params;

  const { spacing, colors } = useTheme();
  const [currentFilters, setCurrentFilters] = useState<{
    currentYear?: string;
    currentTeacherId?: string;
  }>({
    currentYear: year ? String(year) : undefined,
    currentTeacherId: teacherId ? String(teacherId) : undefined,
  });

  const { data: statistics, isFetching } = useGetCourseStatistics({
    courseShortcode: shortCode,
    teacherId: currentFilters.currentTeacherId,
    year: currentFilters.currentYear,
  });

  const filters = useMemo(() => {
    return computeStatisticsFilters(
      statistics,
      currentFilters.currentYear,
      currentFilters.currentTeacherId,
    );
  }, [currentFilters.currentYear, statistics, currentFilters.currentTeacherId]);

  useEffect(() => {
    const shouldSetYearFromStatistics =
      currentFilters.currentYear === undefined &&
      statistics?.year !== undefined;
    const shouldSetTeacherFromStatistics =
      currentFilters.currentTeacherId === undefined &&
      statistics?.teacher !== undefined;

    if (shouldSetYearFromStatistics || shouldSetTeacherFromStatistics) {
      setCurrentFilters(prev => ({
        ...prev,
        currentYear: statistics?.year ? String(statistics.year) : undefined,
        currentTeacherId: statistics?.teacher
          ? String(statistics.teacher.id)
          : undefined,
      }));
    }
  }, [statistics, currentFilters]);

  const styles = useStylesheet(createStyles);

  const graphWidth =
    Dimensions.get('window').width -
    Platform.select({ ios: 128, android: 100 })!;

  return (
    <CourseStatisticsBottomSheets>
      {({
        onPresentEnrolledExamModalPress,
        onPresentEnrolledExamDetailModalPress,
        onPresentGradesDetailModalPress,
      }) => {
        return (
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{
              paddingVertical: spacing[5],
              paddingBottom: spacing['20'],
            }}
          >
            <SafeAreaView>
              <CourseStatisticsFilters
                {...filters}
                onTeacherChanged={nextTeacherId => {
                  setCurrentFilters(prev => ({
                    ...prev,
                    currentTeacherId: nextTeacherId,
                  }));
                }}
                onYearChanged={nextYear => {
                  setCurrentFilters(prev => ({
                    ...prev,
                    currentYear: nextYear,
                  }));
                }}
              />
              <View style={styles.container}>
                <View>
                  <SectionHeader
                    accessible
                    accessibilityLabel={t(
                      'courseStatisticsScreen.enrolledExamTitle',
                    )}
                    title={t('courseStatisticsScreen.enrolledExamTitle')}
                    trailingIcon={{
                      onPress: onPresentEnrolledExamModalPress,
                      accessibilityLabel: t(
                        'courseStatisticsScreen.enrolledExamInfo',
                      ),
                      icon: faQuestionCircle,
                      color: colors.link,
                    }}
                  />
                  <Card>
                    <LoadingContainer loading={isFetching}>
                      <EnrolledExamChart
                        width={graphWidth}
                        statistics={statistics}
                        noOfSections={4}
                      />
                    </LoadingContainer>
                  </Card>
                </View>
                <View>
                  <SectionHeader
                    accessible
                    accessibilityLabel={t(
                      'courseStatisticsScreen.enrolledExamDetailTitle',
                    )}
                    title={t('courseStatisticsScreen.enrolledExamDetailTitle')}
                    trailingIcon={{
                      onPress: onPresentEnrolledExamDetailModalPress,
                      accessibilityLabel: t(
                        'courseStatisticsScreen.enrolledExamDetailInfo',
                      ),
                      icon: faQuestionCircle,
                      color: colors.link,
                    }}
                  />
                  <Card>
                    <LoadingContainer loading={isFetching}>
                      <EnrolledExamDetailChart
                        width={graphWidth}
                        statistics={statistics}
                        noOfSections={4}
                      />
                    </LoadingContainer>
                  </Card>
                </View>

                <View>
                  <SectionHeader
                    accessible
                    accessibilityLabel={t(
                      'courseStatisticsScreen.examGradeDetailTitle',
                    )}
                    title={t('courseStatisticsScreen.examGradeDetailTitle')}
                    trailingIcon={{
                      onPress: onPresentGradesDetailModalPress,
                      accessibilityLabel: t(
                        'courseStatisticsScreen.examGradeDetailInfo',
                      ),
                      icon: faQuestionCircle,
                      color: colors.link,
                    }}
                  />
                  <Card>
                    <LoadingContainer loading={isFetching}>
                      <CourseGradesChart
                        width={graphWidth}
                        statistics={statistics}
                      />
                    </LoadingContainer>
                  </Card>
                </View>
              </View>
            </SafeAreaView>
          </ScrollView>
        );
      }}
    </CourseStatisticsBottomSheets>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing[2],
    },
  });
