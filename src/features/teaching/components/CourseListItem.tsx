import { useTranslation } from 'react-i18next';

import { ListItem } from '@lib/ui/components/ListItem';
import { CourseOverview } from '@polito/api-client';

interface Props {
  course: CourseOverview;
}

export const CourseListItem = ({ course }: Props) => {
  const { t } = useTranslation();

  return (
    <ListItem
      linkTo={
        course.id != null
          ? {
              screen: 'Course',
              params: { id: course.id, courseName: course.name },
            }
          : undefined
      }
      title={course.name}
      subtitle={`${course.cfu} ${t('words.credits')}`}
    />
  );
};
