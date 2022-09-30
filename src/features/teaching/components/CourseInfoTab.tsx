import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { MetricCard } from '@lib/ui/components/MetricCard';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useGetCourse,
  useGetCourseExams,
} from '../../../core/queries/courseHooks';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseInfoTab = ({ courseId }: CourseTabProps) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const courseQuery = useGetCourse(courseId);
  const courseExamsQuery = useGetCourseExams(
    courseId,
    courseQuery.data?.data.shortcode,
  );

  return (
    <ScrollView
      style={[{ flex: 1 }, bottomBarAwareStyles]}
      refreshControl={createRefreshControl(courseQuery, courseExamsQuery)}
    >
      <Grid style={{ padding: spacing[5] }}>
        <MetricCard
          name={t('Teacher')}
          value={
            courseQuery.data?.data
              .teacherId /* TODO update once get teacher hook is available */
          }
        />
        <MetricCard
          name={t('Academic year')}
          value={courseQuery.data?.data.year}
        />

        <MetricCard name={t('Credits')} value={courseQuery.data?.data.cfu} />
        <MetricCard
          name={t('Period')}
          value={courseQuery.data?.data.teachingPeriod}
        />
      </Grid>
      <Section>
        <SectionHeader
          title={t('This course in the agenda')}
          linkTo={{ screen: 'AgendaScreen' }}
        />
      </Section>
      {courseExamsQuery.data?.data.length > 0 && (
        <Section>
          <SectionHeader title={t('Exams')} />
          <SectionList>
            {courseExamsQuery.data?.data.map(exam => (
              <ListItem
                key={exam.id}
                title={exam.courseName}
                subtitle={`${exam.examStartsAt.toLocaleString()} - ${
                  exam.classrooms
                }`}
                linkTo={{
                  screen: 'Exam',
                  params: { id: exam.id },
                }}
              />
            ))}
          </SectionList>
        </Section>
      )}
      <Section>
        <SectionHeader title={t('Staff')} />
        <SectionList>
          {courseQuery.data?.data.staff.map(member => (
            <ListItem
              key={member.id}
              title={member.id + ''}
              subtitle={member.role}
              linkTo={{
                screen: 'Person',
                params: { id: member.id },
              }}
            />
          ))}
        </SectionList>
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
