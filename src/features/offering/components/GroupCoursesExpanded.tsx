import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { OfferingCourseOverview } from '@polito/api-client/models/OfferingCourseOverview';

import { useDegreeContext } from '../contexts/DegreeContext';
import { CourseTrailingItem } from './CourseTrailingItem';

interface Props {
  courses: OfferingCourseOverview[];
  disabled?: boolean;
}
export const GroupCoursesExpanded = ({ courses, disabled }: Props) => {
  const { year } = useDegreeContext();

  return (
    <OverviewList
      rounded={true}
      style={{ elevation: 0 }}
      accessible={true}
      accessibilityRole="list"
    >
      {courses.map(course => {
        return (
          <ListItem
            title={course.name}
            titleProps={{ numberOfLines: undefined }}
            key={course.name}
            linkTo={{
              screen: 'DegreeCourse',
              params: {
                courseShortcode: course.shortcode,
                teachingYear: year,
              },
            }}
            trailingItem={<CourseTrailingItem cfu={course.cfu} />}
            disabled={disabled}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${course.name}, ${course.cfu} CFU`}
            accessibilityHint="Tocca per visualizzare i dettagli del corso"
          />
        );
      })}
    </OverviewList>
  );
};
