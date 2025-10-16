import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

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
  dateFormatter,
  formatDate,
  formatReadableDate,
  isValidDate,
} from '../../../utils/dates';
import { CourseIcon } from '../../courses/components/CourseIcon';
import { ExamStatusBadge } from './ExamStatusBadge';

interface Props {
  exam: Exam;
  accessible?: boolean;
  accessibilityLabel?: string;
  bottomBorder?: boolean;
}

export const ExamListItem = ({
  exam,
  accessibilityLabel = '',
  bottomBorder = true,
  ...rest
}: Props) => {
  const { t } = useTranslation();

  const { courses: coursesPreferences, accessibility } =
    usePreferencesContext();
  const { colors, spacing } = useTheme();
  const formatHHmm = dateFormatter('HH:mm');
  const listItemProps = useMemo(() => {
    let dateTime,
      accessibleDateTime = '';

    const status = t(`common.examStatus.${exam.status}`);

    if (!exam.examStartsAt || !isValidDate(exam?.examStartsAt)) {
      dateTime = t('common.dateToBeDefined');
    } else {
      dateTime = formatDate(exam.examStartsAt);

      if (exam.isTimeToBeDefined) {
        dateTime += `, ${t('common.timeToBeDefined')}`;
        accessibleDateTime = `${dateTime}.`;
      } else {
        const time = formatHHmm(exam.examStartsAt);
        accessibleDateTime += `${dateTime}. ${t('common.time')} ${time}.`;
        dateTime += `, ${time}`;
      }
    }

    return {
      accessibilityLabel: `${accessibilityLabel} ${exam.courseName} ${accessibleDateTime} ${status}`,
    };
  }, [accessibilityLabel, exam, t, formatHHmm]);

  return (
    <View style={{ rowGap: spacing[3] }}>
      <ListItem
        linkTo={{
          screen: 'Exam',
          params: { id: exam.id },
        }}
        title={exam.courseName}
        accessibilityRole="button"
        leadingItem={
          <CourseIcon
            icon={coursesPreferences[exam.uniqueShortcode]?.icon}
            color={coursesPreferences[exam.uniqueShortcode]?.color}
            isHidden={coursesPreferences[exam.uniqueShortcode]?.isHidden}
          />
        }
        trailingItem={
          accessibility?.fontSize && accessibility.fontSize < 175 ? (
            <Row align="center" pl={2}>
              <ExamStatusBadge exam={exam} textOnly />
              {IS_IOS ? <DisclosureIndicator /> : undefined}
            </Row>
          ) : undefined
        }
        subtitle={
          accessibility?.fontSize && accessibility.fontSize < 175 ? (
            <Row gap={2.5} pt={1}>
              <Row
                gap={1}
                accessible
                accessibilityLabel={`${t('common.date')}, ${
                  exam.examStartsAt
                    ? formatReadableDate(exam.examStartsAt, true)
                    : t('common.dateToBeDefined')
                }`}
              >
                <Icon icon={faCalendar} color={colors.secondaryText} />
                <Text variant="secondaryText">
                  {exam.examStartsAt && isValidDate(exam?.examStartsAt)
                    ? formatReadableDate(exam.examStartsAt, true)
                    : t('common.dateToBeDefinedShort')}
                </Text>
              </Row>
              {(exam.places?.length ?? 0) > 0 && (
                <Row
                  gap={1}
                  flexShrink={1}
                  accessible
                  accessibilityLabel={`${t('common.location')}, ${exam.places?.map(place => place.name).join(', ')}`}
                >
                  <Icon icon={faLocationDot} color={colors.secondaryText} />
                  <Text
                    variant="secondaryText"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flexShrink: 1 }}
                  >
                    {exam.places?.map(place => place.name).join(', ')}
                  </Text>
                </Row>
              )}
            </Row>
          ) : (
            <>
              <Row gap={1}>
                <Icon
                  icon={faCalendar}
                  style={{ paddingVertical: spacing[8] }}
                  color={colors.secondaryText}
                />
                <Text variant="secondaryText">
                  {exam.examStartsAt && isValidDate(exam?.examStartsAt)
                    ? formatReadableDate(exam.examStartsAt, true)
                    : t('common.dateToBeDefinedShort')}
                </Text>
              </Row>
              {(exam.places?.length ?? 0) > 0 && (
                <Row gap={1} flexShrink={1}>
                  <Icon
                    icon={faLocationDot}
                    style={{ paddingVertical: spacing[8] }}
                    color={colors.secondaryText}
                  />
                  <Text
                    variant="secondaryText"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flexShrink: 1 }}
                  >
                    {exam.places?.map(place => place.name).join(', ')}
                  </Text>
                </Row>
              )}
              <Row align="center" pl={2}>
                <ExamStatusBadge exam={exam} textOnly />
                {IS_IOS ? <DisclosureIndicator /> : undefined}
              </Row>
            </>
          )
        }
        {...listItemProps}
        {...rest}
      />

      {bottomBorder &&
        accessibility?.fontSize &&
        accessibility.fontSize > 150 && (
          <View
            style={{
              height: 1,
              backgroundColor: colors.divider,
              marginHorizontal: spacing[4],
            }}
          />
        )}
    </View>
  );
};
