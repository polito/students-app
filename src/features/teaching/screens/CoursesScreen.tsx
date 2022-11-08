import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { CourseListItem } from '../components/CourseListItem';

export const CoursesScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const coursesQuery = useGetCourses();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={createRefreshControl(coursesQuery)}
      style={bottomBarAwareStyles}
    >
      {!coursesQuery.isLoading &&
        Object.entries(
          coursesQuery.data.data.reduce((byPeriod, course) => {
            (byPeriod[course.teachingPeriod] =
              byPeriod[course.teachingPeriod] ?? []).push(course);
            return byPeriod;
          }, {} as Record<string, Array<typeof coursesQuery.data.data[0]>>),
        ).map(([period, courses]) => (
          <Section key={period}>
            <SectionHeader
              title={
                period !== 'undefined'
                  ? `${t('Period')} ${period}`
                  : t('coursesScreen.otherCoursesSectionTitle')
              }
            />
            <SectionList>
              {courses.map(course => (
                <CourseListItem key={course.shortcode} course={course} />
              ))}
            </SectionList>
          </Section>
        ))}
    </ScrollView>
  );
};
