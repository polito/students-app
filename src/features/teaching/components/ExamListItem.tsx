import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  faCalendar,
  faCalendarCheck,
} from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { ExamStatusEnum } from '@polito/api-client';

import { Exam } from '../../../core/types/Exam';
import { formatDate, formatDateTime } from '../../../utils/dates';

interface Props {
  exam: Exam;
}

export const ExamListItem = ({ exam }: Props) => {
  const { fontSizes } = useTheme();
  const { t } = useTranslation();

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
      subtitle={subtitle}
      leadingItem={
        exam.status === ExamStatusEnum.Booked ? (
          <Icon icon={faCalendarCheck} size={fontSizes['2xl']} />
        ) : (
          <Icon icon={faCalendar} size={fontSizes['2xl']} />
        )
      }
    />
  );
};
