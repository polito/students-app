import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { MetricCard } from '@lib/ui/components/MetricCard';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import {
  useGetGrades,
  useGetStudent,
} from '../../../core/queries/studentHooks';
import { ProgressChart } from '../components/ProgressChart';

export const TranscriptScreen = () => {
  const { t } = useTranslation();
  const { spacing, colors, fontSizes, fontWeights } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const studentQuery = useGetStudent();
  const gradesQuery = useGetGrades();
  const refreshControl = useRefreshControl(studentQuery, gradesQuery);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        {
          paddingVertical: spacing[5],
        },
        bottomBarAwareStyles,
      ]}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <Section>
        <SectionHeader title={t('transcriptScreen.yourCareer')} />
        <Card
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[4],
            marginTop: spacing[2],
            marginBottom: spacing[3],
          }}
        >
          <View style={{ flex: 1 }}>
            <Text>{t('transcriptScreen.acquiredCreditsLabel')}</Text>
            <Text
              style={{
                color: colors.secondary[500],
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.semibold,
                marginBottom: spacing[2],
              }}
            >
              40/120 CFU
            </Text>
            <Text>{t('transcriptScreen.attendedCreditsLabel')}</Text>
            <Text
              style={{
                color: colors.primary[400],
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.semibold,
              }}
            >
              80/120 CFU
            </Text>
          </View>
          <ProgressChart
            data={[80 / 120, 40 / 120]}
            colors={[colors.primary[400], colors.secondary[500]]}
          />
        </Card>
      </Section>

      <Section>
        <SectionHeader title={t('transcriptScreen.thisYear')} />
        <Card
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing[4],
            marginTop: spacing[2],
            marginBottom: spacing[3],
          }}
        >
          <View style={{ flex: 1 }}>
            <Text>{t('transcriptScreen.acquiredCreditsLabel')}</Text>
            <Text
              style={{
                color: colors.secondary[500],
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.semibold,
                marginBottom: spacing[2],
              }}
            >
              6/60 CFU
            </Text>
            <Text>{t('transcriptScreen.attendedCreditsLabel')}</Text>
            <Text
              style={{
                color: colors.primary[400],
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.semibold,
              }}
            >
              20/60 CFU
            </Text>
          </View>
          <ProgressChart
            data={[20 / 60, 6 / 60]}
            colors={[colors.primary[400], colors.secondary[500]]}
          />
        </Card>
      </Section>

      <Section>
        <SectionHeader title={t('transcriptScreen.averages')} />
        <Grid style={{ paddingHorizontal: spacing[5], marginTop: spacing[2] }}>
          <MetricCard
            name={t('transcriptScreen.weightedAverageLabel')}
            value={studentQuery.data?.data.averageGrade}
          />
          <MetricCard
            name={t('transcriptScreen.finalAverageLabel')}
            value={studentQuery.data?.data.averageGradePurged ?? '--'}
          />
        </Grid>
      </Section>

      <Section>
        <SectionHeader
          title={t('transcriptScreen.provisionalGradesSectionTitle')}
        />
        <SectionList>
          {gradesQuery.data?.data.map(grade => (
            <ListItem
              key={grade.courseName}
              title={grade.courseName}
              subtitle={new Date(grade.date).toLocaleDateString()}
              trailingItem={<Text variant="title">{grade.grade}</Text>}
            />
          ))}
        </SectionList>
      </Section>
      <Section>
        <SectionHeader title={t('Transcript')} />
        <SectionList>
          {gradesQuery.data?.data.map(grade => (
            <ListItem
              key={grade.courseName}
              title={grade.courseName}
              subtitle={new Date(grade.date).toLocaleDateString()}
              trailingItem={<Text variant="title">{grade.grade}</Text>}
            />
          ))}
        </SectionList>
      </Section>
    </ScrollView>
  );
};
