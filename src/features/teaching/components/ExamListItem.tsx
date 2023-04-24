import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ListItem } from '@lib/ui/components/ListItem';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { Exam } from '../../../core/types/api';
import { formatDate, formatTime } from '../../../utils/dates';
import { CourseIcon } from './CourseIcon';

interface Props {
  exam: Exam;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export const ExamListItem = ({
  exam,
  accessibilityLabel = '',
  ...rest
}: Props) => {
  const { t } = useTranslation();

  const { courses: coursesPreferences } = usePreferencesContext();

  const listItemProps = useMemo(() => {
    let dateTime,
      accessibleDateTime = '';

    const status = t(`common.examStatus.${exam.status}`);

    if (!exam.examStartsAt) {
      dateTime = t('common.dateToBeDefined');
    } else {
      dateTime = formatDate(exam.examStartsAt);

      if (exam.isTimeToBeDefined) {
        dateTime += `, ${t('common.timeToBeDefined')}`;
        accessibleDateTime = `${dateTime}.`;
      } else {
        const time = formatTime(exam.examStartsAt);
        accessibleDateTime += `${dateTime}. ${t('common.time')} ${time}.`;
        dateTime += `, ${time}`;
      }
    }

    return {
      subtitle: `${dateTime}`,
      accessibilityLabel: `${accessibilityLabel} ${exam.courseName} ${accessibleDateTime} ${status}`,
    };
  }, [accessibilityLabel, exam, t]);

  return (
    <ListItem
      linkTo={{
        screen: 'Exam',
        params: { id: exam.id },
      }}
      title={exam.courseName}
      accessibilityRole="button"
      leadingItem={
        <CourseIcon
          icon={coursesPreferences[exam.courseId]?.icon}
          color={coursesPreferences[exam.courseId]?.color}
        />
      }
      {...listItemProps}
      {...rest}
    />
  );
};
