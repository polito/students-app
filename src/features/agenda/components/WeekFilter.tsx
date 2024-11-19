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

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';

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
  const { language } = usePreferencesContext();
  const endOfWeek = useMemo(() => {
    return current.plus({ days: daysPerWeek });
  }, [current, daysPerWeek]);

  return (
    <Row align="center">
      <IconButton
        icon={faChevronLeft}
        accessibilityLabel={t('loginScreen.showPassword')}
        color={colors.secondaryText}
        disabled={isPrevWeekDisabled}
        onPress={() => getPrev()}
      />

      <Text style={styles.item}>
        {/* workaround because toFormat from luxon is not working on iOS */}
        {/* {current.toFormat('d MMM')} - {endOfWeek.toFormat('d MMM')} */}
        {current.toJSDate().toLocaleDateString(language, {
          day: '2-digit',
          month: 'short',
        })}{' '}
        -{' '}
        {endOfWeek
          .toJSDate()
          .toLocaleDateString(language, { day: '2-digit', month: 'short' })}
      </Text>
      <IconButton
        icon={faChevronRight}
        accessibilityLabel={t('loginScreen.showPassword')}
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
