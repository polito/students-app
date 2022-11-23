import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@lib/ui/components/Card';
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

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import {
  useGetGrades,
  useGetStudent,
} from '../../../core/queries/studentHooks';
import { globalStyles } from '../../../core/styles/globalStyles';
import { formatDate } from '../../../utils/dates';
import { formatGrade } from '../../../utils/grades';
import { ProgressChart } from '../components/ProgressChart';

export const TranscriptScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
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
    () => gradesQuery.data?.data.filter(g => !g.isProvisional) ?? [],
    [gradesQuery],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, bottomBarAwareStyles]}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <Section>
        <SectionHeader title={t('transcriptScreen.yourCareer')} />
        <Card style={styles.metricsCard}>
          <View style={globalStyles.grow}>
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
        <Card style={styles.metricsCard}>
          <View style={globalStyles.grow}>
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
        <SectionHeader title={t('transcriptScreen.averages')} />
        <Card style={styles.metricsCard}>
          <Grid>
            <Metric
              title={t('transcriptScreen.weightedAverageLabel')}
              value={studentQuery.data?.data.averageGrade ?? '--'}
              style={globalStyles.grow}
            />
            <Metric
              title={t('transcriptScreen.finalAverageLabel')}
              value={studentQuery.data?.data.averageGradePurged ?? '--'}
              color={colors.primary[400]}
              style={globalStyles.grow}
            />
          </Grid>
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
                subtitle={formatDate(new Date(grade.date))}
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
          {transcriptGrades.map(grade => (
            <ListItem
              key={grade.courseName}
              title={grade.courseName}
              subtitle={new Date(grade.date).toLocaleDateString()}
              trailingItem={
                <Text variant="title" style={styles.grade}>
                  {t(formatGrade(grade.grade))}
                </Text>
              }
            />
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
    metricsCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      marginTop: spacing[2],
      marginBottom: spacing[3],
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    grade: {
      marginLeft: spacing[2],
    },
  });
