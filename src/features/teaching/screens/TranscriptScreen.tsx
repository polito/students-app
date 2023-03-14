import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import {
  useGetGrades,
  useGetStudent,
} from '../../../core/queries/studentHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { formatDate } from '../../../utils/dates';
import { formatFinalGrade, formatGrade } from '../../../utils/grades';
import { ProgressChart } from '../components/ProgressChart';

export const TranscriptScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const studentQuery = useGetStudent();
  const gradesQuery = useGetGrades();
  const refreshControl = useRefreshControl(studentQuery, gradesQuery);
  const {
    enrollmentCredits,
    enrollmentAttendedCredits,
    enrollmentAcquiredCredits,
    totalAttendedCredits,
    totalAcquiredCredits,
    totalCredits,
  } = studentQuery.data?.data ?? {};

  const provisionalGrades = useMemo(
    () => gradesQuery.data?.data.filter(g => g.isProvisional) ?? [],
    [gradesQuery],
  );
  const transcriptGrades = useMemo(
    () => gradesQuery.data?.data.filter(g => !g.isProvisional),
    [gradesQuery],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <Section>
        <SectionHeader title={t('transcriptScreen.yourCareer')} />
        <Card style={styles.chartCard}>
          <View style={GlobalStyles.grow}>
            <Metric
              title={t('transcriptScreen.acquiredCreditsLabel')}
              value={`${totalAcquiredCredits ?? '--'}/${
                totalCredits ?? '--'
              } CFU`}
              style={styles.spaceBottom}
            />
            <Metric
              title={t('transcriptScreen.attendedCreditsLabel')}
              value={`${totalAttendedCredits ?? '--'}/${
                totalCredits ?? '--'
              } CFU`}
              color={colors.primary[400]}
            />
          </View>
          <ProgressChart
            data={
              totalCredits
                ? [
                    totalAttendedCredits / totalCredits,
                    totalAcquiredCredits / totalCredits,
                  ]
                : []
            }
            colors={[colors.primary[400], colors.secondary[500]]}
          />
        </Card>
      </Section>

      <Section>
        <SectionHeader title={t('transcriptScreen.thisYear')} />
        <Card style={styles.chartCard}>
          <View style={GlobalStyles.grow}>
            <Metric
              title={t('transcriptScreen.acquiredCreditsLabel')}
              value={`${enrollmentAcquiredCredits}/${enrollmentCredits} CFU`}
              style={styles.spaceBottom}
            />
            <Metric
              title={t('transcriptScreen.attendedCreditsLabel')}
              value={`${enrollmentAttendedCredits}/${enrollmentCredits} CFU`}
              color={colors.primary[400]}
            />
          </View>
          <ProgressChart
            data={
              enrollmentCredits
                ? [
                    enrollmentAttendedCredits / enrollmentCredits,
                    enrollmentAcquiredCredits / enrollmentCredits,
                  ]
                : []
            }
            colors={[colors.primary[400], colors.secondary[500]]}
          />
        </Card>
      </Section>

      <Section>
        <SectionHeader title={t('transcriptScreen.averagesAndGrades')} />
        <Card style={styles.metricsCard}>
          <Grid>
            <Metric
              title={t('transcriptScreen.weightedAverageLabel')}
              value={studentQuery.data?.data.averageGrade ?? '--'}
              style={GlobalStyles.grow}
            />

            <Metric
              title={t('transcriptScreen.estimatedFinalGrade')}
              value={formatFinalGrade(
                studentQuery.data?.data.estimatedFinalGrade,
              )}
              color={colors.primary[400]}
              style={GlobalStyles.grow}
            />

            {studentQuery.data?.data.averageGradePurged != null && (
              <>
                <Metric
                  title={t('transcriptScreen.finalAverageLabel')}
                  value={studentQuery.data?.data.averageGradePurged ?? '--'}
                  color={colors.primary[400]}
                  style={GlobalStyles.grow}
                />

                <Metric
                  title={t('transcriptScreen.estimatedFinalGradePurged')}
                  value={formatFinalGrade(
                    studentQuery.data?.data.estimatedFinalGradePurged,
                  )}
                  color={colors.primary[400]}
                  style={GlobalStyles.grow}
                />
              </>
            )}
          </Grid>

          {studentQuery.data?.data.mastersAdmissionAverageGrade != null && (
            <Metric
              title={t('transcriptScreen.masterAdmissionAverage')}
              value={
                studentQuery.data?.data.mastersAdmissionAverageGrade ?? '--'
              }
              style={[GlobalStyles.grow, styles.additionalMetric]}
            />
          )}
        </Card>
      </Section>

      {provisionalGrades.length > 0 && (
        <Section>
          <SectionHeader
            title={t('transcriptScreen.provisionalGradesSectionTitle')}
          />
          <SectionList>
            {provisionalGrades.map(grade => (
              <ListItem
                key={grade.courseName}
                title={grade.courseName}
                subtitle={formatDate(grade.date)}
                trailingItem={
                  <Text variant="title">{t(formatGrade(grade.grade))}</Text>
                }
              />
            ))}
          </SectionList>
        </Section>
      )}
      <Section>
        <SectionHeader title={t('common.transcript')} />
        <SectionList>
          {transcriptGrades &&
            (transcriptGrades.length ? (
              transcriptGrades.map(grade => (
                <ListItem
                  key={grade.courseName}
                  title={grade.courseName}
                  subtitle={formatDate(grade.date)}
                  trailingItem={
                    <Text variant="title" style={styles.grade}>
                      {t(formatGrade(grade.grade))}
                    </Text>
                  }
                />
              ))
            ) : (
              <EmptyState message={t('transcriptScreen.emptyState')} />
            ))}
        </SectionList>
      </Section>
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
