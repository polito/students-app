import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { MetricCard } from '@lib/ui/components/MetricCard';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Person } from '@polito/api-client/models/Person';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import {
  useGetCourse,
  useGetCourseExams,
} from '../../../core/queries/courseHooks';
import { useGetPersons } from '../../../core/queries/peopleHooks';
import { CourseTabProps } from '../screens/CourseScreen';
import { ExamListItem } from './ExamListItem';

type StaffMember = Person & { courseRole: string };

export const CourseInfoTab = ({ courseId }: CourseTabProps) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const courseQuery = useGetCourse(courseId);
  const courseExamsQuery = useGetCourseExams(
    courseId,
    courseQuery.data?.data.shortcode,
  );
  const { queries: staffQueries, isLoading: isStaffLoading } = useGetPersons(
    courseQuery.data?.data.staff.map(s => s.id),
  );
  const refreshControl = useRefreshControl(
    courseQuery,
    courseExamsQuery,
    ...staffQueries,
  );

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [teacher, setTeacher] = useState<StaffMember>(null);

  useEffect(() => {
    if (isStaffLoading) return;

    const staffData: StaffMember[] = [];
    const teacherId = courseQuery.data.data.teacherId;
    courseQuery.data.data.staff.forEach(s =>
      staffData.push({
        courseRole: s.role,
      }),
    );

    staffQueries.forEach((staffQuery, index) => {
      const personData = staffQuery.data.data;

      staffData[index] = { ...personData, ...staffData[index] };

      if (personData.id === teacherId) {
        setTeacher(staffData[index]);
      }
    });

    setStaff(staffData);
  }, [isStaffLoading]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={bottomBarAwareStyles}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <Grid style={{ padding: spacing[5] }}>
        <MetricCard
          name={t('courseInfoTab.teacherLabel')}
          value={teacher && `${teacher.firstName} ${teacher.lastName}`}
        />
        <MetricCard
          name={t('courseInfoTab.yearLabel')}
          value={courseQuery.data?.data.year}
        />
        <MetricCard
          name={t('courseInfoTab.creditsLabel')}
          value={courseQuery.data?.data.cfu}
        />
        <MetricCard
          name={t('courseInfoTab.periodLabel')}
          value={courseQuery.data?.data.teachingPeriod}
        />
      </Grid>
      <Section>
        <SectionHeader
          title={t('courseInfoTab.agendaSectionTitle')}
          linkTo={{ screen: 'AgendaScreen' }}
        />
      </Section>
      {courseExamsQuery.data?.data.length > 0 && (
        <Section>
          <SectionHeader title={t('examsScreen.title')} />
          <SectionList loading={courseExamsQuery.isLoading} indented>
            {courseExamsQuery.data?.data.map(exam => (
              <ExamListItem key={exam.id} exam={exam} />
            ))}
          </SectionList>
        </Section>
      )}
      <Section>
        <SectionHeader title={t('courseInfoTab.staffSectionTitle')} />
        <SectionList indented>
          {staff.map((member, index) => (
            // TODO cleanup key when real API are used
            <PersonListItem
              key={`${member.id}${index}`}
              person={member}
              subtitle={member.courseRole}
            />
          ))}
        </SectionList>
      </Section>
      <Section>
        <SectionHeader title={t('courseInfoTab.moreSectionTitle')} />
        <SectionList>
          <ListItem
            title={t('courseGuideScreen.title')}
            linkTo={{ screen: 'CourseGuide', params: { courseId } }}
          />
        </SectionList>
      </Section>
    </ScrollView>
  );
};
