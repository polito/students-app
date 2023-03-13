import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { Person } from '@polito/api-client/models/Person';

import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import {
  useGetCourse,
  useGetCourseExams,
} from '../../../core/queries/courseHooks';
import { useGetPersons } from '../../../core/queries/peopleHooks';
import { globalStyles } from '../../../core/styles/globalStyles';
import { CourseTabProps } from '../screens/CourseScreen';
import { ExamListItem } from './ExamListItem';

type StaffMember = Person & { courseRole: string };

export const CourseInfoTab = ({ courseId }: CourseTabProps) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const [staff, setStaff] = useState<StaffMember[]>([]);
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

  useEffect(() => {
    if (isStaffLoading) {
      return;
    }
    const staffData: StaffMember[] = [];
    courseQuery.data.data.staff.forEach(s =>
      staffData.push({
        courseRole: s.role,
      }),
    );

    staffQueries.forEach((staffQuery, index) => {
      const personData = staffQuery.data.data;
      staffData[index] = { ...personData, ...staffData[index] };
    });

    setStaff(staffData);
  }, [isStaffLoading]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <Section style={styles.heading}>
        <ScreenTitle title={courseQuery.data?.data.name} />
        <Text variant="caption">{courseQuery.data?.data.shortcode}</Text>
      </Section>
      <Card style={styles.metricsCard}>
        <Grid>
          <Metric
            title={t('common.period')}
            value={`${courseQuery.data?.data.teachingPeriod ?? '--'} - ${
              courseQuery.data?.data.year ?? '--'
            }`}
            style={globalStyles.grow}
          />
          <Metric
            title={t('courseInfoTab.creditsLabel')}
            value={t('common.creditsWithUnit', {
              credits: courseQuery.data?.data.cfu,
            })}
            style={globalStyles.grow}
          />
        </Grid>
      </Card>

      <Section>
        <SectionHeader title={t('courseInfoTab.agendaSectionTitle')} />
        <SectionList emptyStateText={t('common.comingSoon')}></SectionList>
      </Section>
      {courseExamsQuery.data?.length > 0 && (
        <Section>
          <SectionHeader title={t('examsScreen.title')} />
          <SectionList loading={courseExamsQuery.isLoading} indented>
            {courseExamsQuery.data?.map(exam => (
              <ExamListItem key={exam.id} exam={exam} />
            ))}
          </SectionList>
        </Section>
      )}
      <Section>
        <SectionHeader title={t('courseInfoTab.staffSectionTitle')} />
        <SectionList indented>
          {staff.map(member => (
            <PersonListItem
              key={`${member.id}`}
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

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    heading: {
      padding: spacing[5],
      paddingBottom: 0,
    },
    metricsCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: spacing[4],
      marginTop: 0,
      marginBottom: spacing[7],
    },
  });
