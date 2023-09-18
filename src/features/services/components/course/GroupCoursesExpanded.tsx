import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { OfferingCourseOverview } from '@polito/api-client/models/OfferingCourseOverview';

import { CourseTrailingItem } from './CourseTrailingItem';

interface Props {
  courses: OfferingCourseOverview[];
}
export const GroupCoursesExpanded = ({ courses }: Props) => {
  const { spacing } = useTheme();
  return (
    <OverviewList
      style={{
        marginTop: spacing[4],
        marginHorizontal: 0,
      }}
    >
      {courses.map(course => {
        return (
          <ListItem
            title={course.name}
            titleStyle={{ maxWidth: '90%' }}
            titleProps={{ numberOfLines: undefined }}
            key={course.name}
            linkTo={{
              screen: 'DegreeCourse',
              params: {
                courseShortcode: course.shortcode,
                teachingYear: course.teachingYear,
              },
            }}
            trailingItem={<CourseTrailingItem cfu={course.cfu} />}
          />
        );
      })}
    </OverviewList>
  );
};
