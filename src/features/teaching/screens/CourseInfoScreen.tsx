import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Grid } from '@lib/ui/components/Grid';
import { ListItem } from '@lib/ui/components/ListItem';
import { Metric } from '@lib/ui/components/Metric';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { Person } from '@polito/api-client/models/Person';
import { useQueryClient } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  CourseSectionEnum,
  getCourseKey,
  useGetCourse,
  useGetCourseExams,
} from '../../../core/queries/courseHooks';
import { useGetPersons } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { ExamListItem } from '../components/ExamListItem';
import { useCourseContext } from '../contexts/CourseContext';

type StaffMember = Person & { courseRole: 'roleHolder' | 'roleCollaborator' };

export const CourseInfoScreen = () => {
  const { t } = useTranslation();
  const courseId = useCourseContext();
  const styles = useStylesheet(createStyles);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const courseQuery = useGetCourse(courseId);
  const courseExamsQuery = useGetCourseExams(
    courseId,
    courseQuery.data?.shortcode,
  );
  const { queries: staffQueries, isLoading: isStaffLoading } = useGetPersons(
    courseQuery.data?.staff.map(s => s.id),
  );

  useEffect(() => {
    if (!courseQuery.data || isStaffLoading) {
      return;
    }
    const staffData: StaffMember[] = [];

    staffQueries.forEach((staffQuery, index) => {
      if (!staffQuery.data) return;

      staffData.push({
        ...staffQuery.data,
        courseRole:
          courseQuery.data.staff[index].role === 'Titolare'
            ? 'roleHolder'
            : 'roleCollaborator',
      });
    });

    setStaff(staffData);
  }, [isStaffLoading]);

  const queryClient = useQueryClient();
  const isGuideDataMissing = useCallback(
    () =>
      queryClient.getQueryData(
        getCourseKey(courseId, CourseSectionEnum.Guide),
      ) === undefined,
    [courseId, queryClient],
  );

  const isGuideDisabled = useOfflineDisabled(isGuideDataMissing);

  return (
    <ScrollView
      style={GlobalStyles.grow}
      refreshControl={
        <RefreshControl
          queries={[courseQuery, courseExamsQuery, ...staffQueries]}
        />
      }
    >
      <SafeAreaView>
        <Section style={styles.heading}>
          <ScreenTitle title={courseQuery.data?.name} />
          <Text variant="caption">{courseQuery.data?.shortcode}</Text>
        </Section>
        <Card style={styles.metricsCard} accessible={true}>
          <Grid>
            <Metric
              title={t('common.period')}
              value={`${courseQuery.data?.teachingPeriod ?? '--'} - ${
                courseQuery.data?.year ?? '--'
              }`}
              style={GlobalStyles.grow}
            />
            <Metric
              title={t('courseInfoTab.creditsLabel')}
              value={t('common.creditsWithUnit', {
                credits: courseQuery.data?.cfu,
              })}
              accessibilityLabel={`${t('courseInfoTab.creditsLabel')}: ${
                courseQuery.data?.cfu
              }`}
              style={GlobalStyles.grow}
            />
          </Grid>
        </Card>
        <Section>
          <SectionHeader title={t('courseInfoTab.agendaSectionTitle')} />
          <OverviewList emptyStateText={t('common.comingSoon')}></OverviewList>
        </Section>
        {courseExamsQuery.data?.length > 0 && (
          <Section>
            <SectionHeader title={t('examsScreen.title')} />
            <OverviewList loading={courseExamsQuery.isLoading} indented>
              {courseExamsQuery.data?.map(exam => (
                <ExamListItem key={exam.id} exam={exam} />
              ))}
            </OverviewList>
          </Section>
        )}
        {staff.length > 0 && (
          <Section>
            <SectionHeader title={t('courseInfoTab.staffSectionTitle')} />
            <OverviewList indented>
              {staff.map(member => (
                <PersonListItem
                  key={`${member.id}`}
                  person={member}
                  subtitle={t(`common.${member.courseRole}`)}
                />
              ))}
            </OverviewList>
          </Section>
        )}
        <Section>
          <SectionHeader title={t('courseInfoTab.moreSectionTitle')} />
          <OverviewList>
            <ListItem
              title={t('courseGuideScreen.title')}
              linkTo={{ screen: 'CourseGuide', params: { courseId } }}
              disabled={isGuideDisabled}
            />
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingTop: spacing[5],
      paddingHorizontal: spacing[4],
    },
    metricsCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: spacing[4],
      marginTop: 0,
      marginBottom: spacing[7],
    },
  });
