import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseOverview } from '@polito/api-client';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { CourseListItem } from '../components/CourseListItem';

export const CoursesScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const coursesQuery = useGetCourses();
  const refreshControl = useRefreshControl(coursesQuery);
  const { accessibilityListLabel } = useAccessibility();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      {coursesQuery.data &&
        (coursesQuery.data.length > 0 ? (
          Object.entries(
            coursesQuery.data.reduce((byPeriod, course) => {
              (byPeriod[course.teachingPeriod] =
                byPeriod[course.teachingPeriod] ?? []).push(course);
              return byPeriod;
            }, {} as Record<string, CourseOverview[]>),
          ).map(([period, courses]) => (
            <Section key={period}>
              <SectionHeader
                title={
                  period !== 'undefined'
                    ? `${t('common.period')} ${period}`
                    : t('coursesScreen.otherCoursesSectionTitle')
                }
                accessibilityLabel={`${
                  period !== 'undefined'
                    ? `${t('common.period')} ${period}`
                    : t('coursesScreen.otherCoursesSectionTitle')
                }. ${t('coursesScreen.total', { total: courses.length })}`}
              />
              <SectionList indented>
                {courses.map((course, index) => (
                  <CourseListItem
                    key={course.shortcode + '' + course.id}
                    course={course}
                    accessible={true}
                    accessibilityLabel={accessibilityListLabel(
                      index,
                      courses.length,
                    )}
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
