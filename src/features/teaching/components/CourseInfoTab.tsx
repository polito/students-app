import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { ListItem } from '@lib/ui/components/ListItem';
import { MetricCard } from '@lib/ui/components/MetricCard';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useGetCourse } from '../hooks/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseInfoTab = ({ courseId }: CourseTabProps) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const courseQuery = useGetCourse(courseId);

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={createRefreshControl(courseQuery)}
    >
      <View style={{ padding: spacing[5] }}>
        <View style={{ flexDirection: 'row', marginBottom: spacing[5] }}>
          <MetricCard
            name={t('Teacher')}
            value={
              courseQuery.data?.data
                .teacherId /* TODO update once get teacher hook is available */
            }
            style={{ marginRight: spacing[5] }}
          />
          <MetricCard
            name={t('Academic year')}
            value={courseQuery.data?.data.year}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <MetricCard
            name={t('Credits')}
            value={courseQuery.data?.data.cfu}
            style={{ marginRight: spacing[5] }}
          />
          <MetricCard
            name={t('Period')}
            value={courseQuery.data?.data.teachingPeriod}
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
    </ScrollView>
  );
};
