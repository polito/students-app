import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { MetricCard } from '@lib/ui/components/MetricCard';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Person } from '@polito-it/api-client/models/Person';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useGetCourse,
  useGetCourseExams,
} from '../../../core/queries/courseHooks';
import { useGetPersons } from '../../../core/queries/peopleHooks';
import { CourseTabProps } from '../screens/CourseScreen';

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

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [teacher, setTeacher] = useState<StaffMember>(null);

  useEffect(() => {
    if (isStaffLoading) return;

    const staffData = [];
    const teacherId = `${courseQuery.data.data.teacherId}`;
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
      style={[{ flex: 1 }, bottomBarAwareStyles]}
      refreshControl={createRefreshControl(
        courseQuery,
        courseExamsQuery,
        ...staffQueries,
      )}
    >
      <Grid style={{ padding: spacing[5] }}>
        <MetricCard
          name={t('Teacher')}
          value={teacher && `${teacher.firstName} ${teacher.lastName}`}
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
