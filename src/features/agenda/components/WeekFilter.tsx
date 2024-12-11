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
  daysPerWeek = 7,
}: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const endOfWeek = useMemo(() => {
    return current.plus({ days: daysPerWeek });
  }, [current, daysPerWeek]);

  return (
    <Row align="center">
      <IconButton
        accessibilityRole="button"
        icon={faChevronLeft}
        accessibilityLabel={t('bookingScreen.previousWeek')}
        color={colors.secondaryText}
        disabled={isPrevWeekDisabled}
        onPress={() => getPrev()}
      />

      <Text style={styles.item}>
        {current.toFormat('d MMM')} - {endOfWeek.toFormat('d MMM')}
      </Text>
      <IconButton
        accessibilityRole="button"
        icon={faChevronRight}
        accessibilityLabel={t('bookingScreen.nextWeek')}
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
