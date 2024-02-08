import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { Metric } from '@lib/ui/components/Metric';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import {
  useGetGrades,
  useGetStudent,
} from '../../../core/queries/studentHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { formatFinalGrade } from '../../../utils/grades';
import { ProgressChart } from '../../teaching/components/ProgressChart';

export const CareerScreen = () => {
  const { t } = useTranslation();
  const { palettes } = useTheme();
  const styles = useStylesheet(createStyles);
  const studentQuery = useGetStudent();
  const gradesQuery = useGetGrades();
  const {
    enrollmentCredits,
    enrollmentAttendedCredits,
    enrollmentAcquiredCredits,
    totalAttendedCredits,
    totalAcquiredCredits,
    totalCredits,
  } = studentQuery.data ?? {};

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl queries={[studentQuery, gradesQuery]} manual />
      }
    >
      <SafeAreaView>
        <Section>
          <SectionHeader title={t('transcriptMetricsScreen.yourCareer')} />
          <Card style={styles.chartCard} accessible={true}>
            <View style={GlobalStyles.grow}>
              <Metric
                title={t('transcriptMetricsScreen.acquiredCreditsLabel')}
                value={`${totalAcquiredCredits ?? '--'}/${
                  totalCredits ?? '--'
                } CFU`}
                style={styles.spaceBottom}
                accessibilityLabel={`${t(
                  'transcriptMetricsScreen.acquiredCreditsLabel',
                )}: ${totalAcquiredCredits} ${t('common.of')} ${totalCredits}`}
              />
              <Metric
                title={t('transcriptMetricsScreen.attendedCreditsLabel')}
                value={`${totalAttendedCredits ?? '--'}/${
                  totalCredits ?? '--'
                } CFU`}
                color={palettes.primary[400]}
                accessibilityLabel={`${t(
                  'transcriptMetricsScreen.attendedCreditsLabel',
                )}: ${totalAttendedCredits} ${t('common.of')} ${totalCredits}`}
              />
            </View>
            <ProgressChart
              data={
                totalCredits
                  ? [
                      (totalAttendedCredits ?? 0) / totalCredits,
                      (totalAcquiredCredits ?? 0) / totalCredits,
                    ]
                  : []
              }
              colors={[palettes.primary[400], palettes.secondary[500]]}
            />
          </Card>
        </Section>

        <Section>
          <SectionHeader title={t('transcriptMetricsScreen.thisYear')} />
          <Card style={styles.chartCard} accessible={true}>
            <View style={GlobalStyles.grow}>
              <Metric
                title={t('transcriptMetricsScreen.acquiredCreditsLabel')}
                value={`${enrollmentAcquiredCredits ?? '--'}/${
                  enrollmentCredits ?? '--'
                } CFU`}
                accessibilityLabel={`${t(
                  'transcriptMetricsScreen.acquiredCreditsLabel',
                )}: ${enrollmentAcquiredCredits} ${t(
                  'common.of',
                )} ${enrollmentCredits}`}
                style={styles.spaceBottom}
              />
              <Metric
                title={t('transcriptMetricsScreen.attendedCreditsLabel')}
                value={`${enrollmentAttendedCredits ?? '--'}/${
                  enrollmentCredits ?? '--'
                } CFU`}
                accessibilityLabel={`${t(
                  'transcriptMetricsScreen.attendedCreditsLabel',
                )}: ${enrollmentCredits} ${t(
                  'common.of',
                )} ${enrollmentCredits}`}
                color={palettes.primary[400]}
              />
            </View>
            <ProgressChart
              data={
                enrollmentCredits
                  ? [
                      (enrollmentAttendedCredits ?? 0) / enrollmentCredits,
                      (enrollmentAcquiredCredits ?? 0) / enrollmentCredits,
                    ]
                  : []
              }
              colors={[palettes.primary[400], palettes.secondary[500]]}
            />
          </Card>
        </Section>

        <Section>
          <SectionHeader
            title={t('transcriptMetricsScreen.averagesAndGrades')}
          />
          <Card style={styles.metricsCard} accessible={true}>
            <Grid>
              <Metric
                title={t('transcriptMetricsScreen.weightedAverageLabel')}
                value={studentQuery.data?.averageGrade ?? '--'}
                style={GlobalStyles.grow}
              />

              <Metric
                title={t('transcriptMetricsScreen.estimatedFinalGrade')}
                value={formatFinalGrade(studentQuery.data?.estimatedFinalGrade)}
                color={palettes.primary[400]}
                style={GlobalStyles.grow}
              />

              {studentQuery.data?.averageGradePurged && (
                <Metric
                  title={t('transcriptMetricsScreen.finalAverageLabel')}
                  value={studentQuery.data.averageGradePurged ?? '--'}
                  style={GlobalStyles.grow}
                />
              )}

              {studentQuery.data?.estimatedFinalGradePurged && (
                <Metric
                  title={t('transcriptMetricsScreen.estimatedFinalGradePurged')}
                  value={formatFinalGrade(
                    studentQuery.data.estimatedFinalGradePurged,
                  )}
                  color={palettes.primary[400]}
                  style={GlobalStyles.grow}
                />
              )}
            </Grid>

            {studentQuery.data?.mastersAdmissionAverageGrade && (
              <Metric
                title={t('transcriptMetricsScreen.masterAdmissionAverage')}
                value={studentQuery.data.mastersAdmissionAverageGrade ?? '--'}
                style={[GlobalStyles.grow, styles.additionalMetric]}
              />
            )}
          </Card>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
    chartCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      marginTop: spacing[2],
      marginBottom: spacing[3],
    },
    metricsCard: {
      padding: spacing[4],
      marginTop: spacing[2],
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    additionalMetric: {
      marginTop: spacing[4],
    },
    grade: {
      marginLeft: spacing[2],
    },
  });
