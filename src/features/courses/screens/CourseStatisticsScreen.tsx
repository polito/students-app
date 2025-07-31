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

import { BottomModal } from '../../../core/components/BottomModal.tsx';
import { useBottomModal } from '../../../core/hooks/useBottomModal.ts';
import { useGetCourseStatistics } from '../../../core/queries/offeringHooks';
import { SharedScreensParamList } from '../../../shared/navigation/SharedScreens';
import { CourseGradesChart } from '../components/CourseGradesChart.tsx';
import { CourseStatisticsFilters } from '../components/CourseStatisticsFilters';
import {
  CourseStatisticsModal,
  CourseStatisticsTypes,
} from '../components/CourseStatisticsModal.tsx';
import { EnrolledExamChart } from '../components/EnrolledExamChart.tsx';
import { EnrolledExamDetailChart } from '../components/EnrolledExamDetailChart.tsx';
import { computeStatisticsFilters } from '../utils/computeStatisticsFilters';

type Props = NativeStackScreenProps<SharedScreensParamList, 'CourseStatistics'>;
export const CourseStatisticsScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { courseShortcode: shortCode, year, teacherId, filter } = route.params;

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

  const {
    open: showBottomModal,
    modal: bottomModal,
    close: closeBottomModal,
  } = useBottomModal();

  const openModal = (type: CourseStatisticsTypes) => {
    showBottomModal(
      <CourseStatisticsModal type={type} onDismiss={closeBottomModal} />,
    );
  };

  return (
    <>
      <BottomModal dismissable {...bottomModal} />
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
            filterType={filter}
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
                  onPress: () =>
                    openModal(CourseStatisticsTypes.enrolledExamBottomSheet),
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
                  onPress: () =>
                    openModal(
                      CourseStatisticsTypes.enrolledExamDetailBottomSheet,
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
                  onPress: () =>
                    openModal(
                      CourseStatisticsTypes.enrolledExamDetailBottomSheet,
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
    </>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing[2],
    },
  });
