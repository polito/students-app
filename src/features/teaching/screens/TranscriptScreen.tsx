import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { MetricCard } from '@lib/ui/components/MetricCard';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import color from 'color';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useGetStudent } from '../../../core/hooks/studentHooks';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetGrades } from '../hooks/gradeHooks';

export const TranscriptScreen = () => {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const studentQuery = useGetStudent();
  const gradesQuery = useGetGrades();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={createRefreshControl(studentQuery, gradesQuery)}
      style={bottomBarAwareStyles}
    >
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing[5],
          marginBottom: spacing[5],
        }}
      >
        <View style={{ flex: 1, marginRight: spacing[5] }}>
          <MetricCard
            name={t('Weighted average')}
            value={studentQuery.data?.data.averageGrade}
            style={{ marginBottom: spacing[5] }}
          />
          <MetricCard
            name={t('Final average')}
            value={studentQuery.data?.data.averageGradePurged}
          />
        </View>
        <Card
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ProgressChart
            data={{
              labels: ['Test'],
              data: [
                studentQuery.data?.data.totalAcquiredCredits /
                  studentQuery.data?.data.totalCredits,
              ],
            }}
            width={120}
            height={120}
            hideLegend={true}
            chartConfig={{
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              color: (opacity = 1) =>
                color(colors.primary[400]).alpha(opacity).toString(),
            }}
          />
        </Card>
      </View>
      <Grid style={{ paddingHorizontal: spacing[5] }}>
        <MetricCard
          name={t('Acquired credits')}
          value={[
            studentQuery.data?.data.totalAcquiredCredits,
            studentQuery.data?.data.totalCredits,
          ].join('/')}
        />
        <MetricCard
          name={t('Attended credits')}
          value={[
            studentQuery.data?.data.enrollmentAttendedCredits,
            studentQuery.data?.data.enrollmentCredits,
          ].join('/')}
        />
      </Grid>
      <Section>
        <SectionHeader title={t('Provisional grades')} />
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
