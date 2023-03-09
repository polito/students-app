import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ListItem } from '@lib/ui/components/ListItem';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { Exam } from '../../../core/types/Exam';
import { formatDate, formatDateTime } from '../../../utils/dates';
import { CourseIcon } from './CourseIcon';

interface Props {
  exam: Exam;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export const ExamListItem = ({ exam, accessibilityLabel, ...rest }: Props) => {
  const { t } = useTranslation();
  const examStatus = exam.status;

  const { courses: coursesPreferences } = usePreferencesContext();

  const subtitle = useMemo(() => {
    let dateTime;
    if (exam.isTimeToBeDefined) {
      dateTime = `${formatDate(exam.examStartsAt)}, ${t(
        'common.timeToBeDefined',
      )}`;
    } else {
      dateTime = formatDateTime(exam.examStartsAt);
    }
    if (exam.classrooms !== '-') {
      return `${dateTime} - ${exam.classrooms}`;
    }
    return dateTime;
  }, [exam]);

  return (
    <ListItem
      linkTo={{
        screen: 'Exam',
        params: { id: exam.id },
      }}
      title={exam.courseName}
      accessibilityRole={'button'}
      accessibilityLabel={`${accessibilityLabel ?? ''} ${
        exam.courseName
      } ${formatDateTime(exam.examStartsAt)} ${t(
        `common.examStatus.${examStatus}`,
      )}`}
      subtitle={subtitle}
      leadingItem={
        <CourseIcon
          icon={coursesPreferences[exam.courseId]?.icon}
          color={coursesPreferences[exam.courseId]?.color}
        />
      }
      {...rest}
    />
  );
};
