import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

interface Props {
  current: DateTime;
  getNext: () => void;
  getPrev: () => void;
  isPrevWeekDisabled: boolean;
  isNextWeekDisabled: boolean;
  daysPerWeek?: number;
}
export const WeekFilter = ({
  current,
  getNext,
  getPrev,
  isPrevWeekDisabled = false,
  isNextWeekDisabled = false,
  daysPerWeek = 6, // The default setting is 6 days a week because the last day otherwise would be the Monday of the following week
}: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const endOfWeek = useMemo(() => {
    return current.plus({ days: daysPerWeek });
  }, [current, daysPerWeek]);

  const week = useMemo(() => {
    return `${current.toFormat('d MMM')} - ${endOfWeek.toFormat('d MMM')}`;
  }, [current, endOfWeek]);

  return (
    <Row
      align="center"
      accessible={true}
      accessibilityLabel={`${current.toFormat('d MMM')} - ${endOfWeek.toFormat(
        'd MMM',
      )}`}
    >
      <IconButton
        accessibilityRole="button"
        icon={faChevronLeft}
        accessibilityLabel={t('agendaScreen.previous week')}
        color={colors.secondaryText}
        disabled={isPrevWeekDisabled}
        onPress={() => getPrev()}
      />
      <Text
        accessible
        accessibilityLabel={week}
        accessibilityRole="text"
        style={styles.item}
      >
        {week}
      </Text>
      <IconButton
        accessibilityRole="button"
        icon={faChevronRight}
        accessibilityLabel={t('agendaScreen.next week')}
        color={colors.secondaryText}
        disabled={isNextWeekDisabled}
        onPress={() => getNext()}
      />
    </Row>
  );
};

const styles = StyleSheet.create({
  item: {
    fontWeight: '500',
  },
});
