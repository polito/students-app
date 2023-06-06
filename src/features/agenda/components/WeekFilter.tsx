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
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { DateTime } from 'luxon';

interface Props {
  current: DateTime;
  getNext: () => void;
  getPrev: () => void;
}
export const WeekFilter = ({ current, getNext, getPrev }: Props) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const styles = useStylesheet(createStyles);

  const endOfWeek = useMemo(() => {
    return current.plus({ days: 6 });
  }, [current]);
  return (
    <Row align="center">
      <IconButton
        icon={faChevronLeft}
        accessibilityLabel={t('loginScreen.showPassword')}
        color={colors.secondaryText}
        onPress={() => getPrev()}
      />

      <Text style={styles.item}>
        {current.toFormat('d MMM')} - {endOfWeek.toFormat('d MMM')}
      </Text>
      <IconButton
        icon={faChevronRight}
        accessibilityLabel={t('loginScreen.showPassword')}
        color={colors.secondaryText}
        onPress={() => getNext()}
      />
    </Row>
  );
};

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    item: {
      fontWeight: '500',
    },
  });
