import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ListItem } from '@lib/ui/components/ListItem';
import { MetricCard } from '@lib/ui/components/MetricCard';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useGetCourse } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseInfoTab = ({
  courseId,
  setIsRefreshing,
  shouldRefresh,
}: CourseTabProps) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { data: overviewResponse, isLoading, refetch } = useGetCourse(courseId);

  useEffect(() => setIsRefreshing(isLoading), [isLoading]);

  useEffect(() => {
    if (shouldRefresh) {
      refetch();
    }
  }, [shouldRefresh]);

  return (
    <>
      <View style={{ padding: spacing[5] }}>
        <View style={{ flexDirection: 'row', marginBottom: spacing[5] }}>
          <MetricCard
            name={t('Teacher')}
            value={overviewResponse.data.teacherId}
            style={{ marginRight: spacing[5] }}
          />
          <MetricCard
            name={t('Academic year')}
            value={overviewResponse.data.year}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <MetricCard
            name={t('Credits')}
            value={overviewResponse.data.cfu}
            style={{ marginRight: spacing[5] }}
          />
          <MetricCard
            name={t('Period')}
            value={overviewResponse.data.teachingPeriod}
          />
        </View>
      </View>
      <Section>
        <SectionHeader
          title={t('This course in the agenda')}
          linkTo={{ screen: 'AgendaScreen' }}
        />
      </Section>
      <Section>
        <SectionHeader title={t('Exams')} linkTo={{ screen: 'ExamScreen' }} />
      </Section>
      <Section>
        <SectionHeader title={t('More')} />
        <SectionList>
          <ListItem
            title={t('Course guide')}
            linkTo={{ screen: 'CourseGuide', params: { courseId } }}
          />
        </SectionList>
      </Section>
    </>
  );
};
