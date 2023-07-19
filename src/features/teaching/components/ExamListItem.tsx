import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { IS_IOS } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { Exam } from '../../../core/types/api';
import {
  formatDate,
  formatReadableDate,
  formatTime,
} from '../../../utils/dates';
import { CourseIcon } from './CourseIcon';
import { ExamStatusBadge } from './ExamStatusBadge';

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
  const { colors } = useTheme();

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
      // subtitle: `${dateTime}`,
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
      trailingItem={
        <Row align="center" pl={2}>
          <ExamStatusBadge exam={exam} textOnly />
          {IS_IOS ? <DisclosureIndicator /> : undefined}
        </Row>
      }
      subtitle={
        <Row gap={2.5} pt={1}>
          <Row gap={1}>
            <Icon icon={faCalendar} color={colors.secondaryText} />
            <Text variant="secondaryText">
              {exam.examStartsAt
                ? formatReadableDate(exam.examStartsAt, true)
                : t('common.dateToBeDefined')}
            </Text>
          </Row>
          <Row gap={1} flexShrink={1}>
            <Icon icon={faLocationDot} color={colors.secondaryText} />
            <Text
              variant="secondaryText"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ flexShrink: 1 }}
            >
              {exam.classrooms}
            </Text>
          </Row>
        </Row>
      }
      {...listItemProps}
      {...rest}
    />
  );
};
