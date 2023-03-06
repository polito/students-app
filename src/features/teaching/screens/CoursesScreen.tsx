import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { CourseListItem } from '../components/CourseListItem';

export const CoursesScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const coursesQuery = useGetCourses();
  const refreshControl = useRefreshControl(coursesQuery);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      {!coursesQuery.isLoading &&
        (coursesQuery.data.data.length > 0 ? (
          Object.entries(
            coursesQuery.data.data.reduce((byPeriod, course) => {
              (byPeriod[course.teachingPeriod] =
                byPeriod[course.teachingPeriod] ?? []).push(course);
              return byPeriod;
            }, {} as Record<string, Array<typeof coursesQuery.data.data[0]>>),
          ).map(([period, courses]) => (
            <Section
              key={period}
              accessibilityHint={t('common.elementCount', {
                count: 1,
                total: coursesQuery.data.data.length,
              })}
            >
              <SectionHeader
                title={
                  period !== 'undefined'
                    ? `${t('common.period')} ${period}`
                    : t('coursesScreen.otherCoursesSectionTitle')
                }
              />
              <SectionList indented>
                {courses.map(course => (
                  <CourseListItem
                    key={course.shortcode + '' + course.id}
                    course={course}
                  />
                ))}
              </SectionList>
            </Section>
          ))
        ) : (
          <EmptyState
            message={t('coursesScreen.emptyState')}
            icon={faChalkboardTeacher}
          />
        ))}
    </ScrollView>
  );
};
