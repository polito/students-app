import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  faCalendar,
  faClock,
  faFrown,
} from '@fortawesome/free-regular-svg-icons';
import {
  faHourglassEnd,
  faHourglassStart,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { DateTime } from 'luxon';

import { BookingCalendarEvent } from '../screens/BookingSlotScreen';
import { BookingField } from './BookingField';
import { BookingSeatsCta } from './BookingSeatsCta';

type Props = {
  close: () => void;
  item: BookingCalendarEvent;
  topicId: string;
};

export const BookingSlotModal = ({ close, item }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { fontSizes } = useTheme();
  const now = DateTime.now().toJSDate();

  const isFull = item.places === item.bookedPlaces;
  const bookingNotYetOpen = !!(
    item?.bookingStartsAt && item?.bookingStartsAt > now
  );

  const canBeBooked = item.canBeBooked;
  const startHour = item.start.toFormat('HH:mm');
  const endHour = item.end.toFormat('HH:mm');
  const day = item.start.toFormat('d MMMM');

  const NotBookableMessage = () => {
    return isFull ? (
      <EmptyState
        icon={faFrown}
        iconSize={fontSizes['4xl']}
        message={t('bookingSeatScreen.noSeatsAvailable')}
      />
    ) : bookingNotYetOpen ? (
      <EmptyState
        icon={faHourglassStart}
        iconSize={fontSizes['4xl']}
        message={[
          t('bookingSeatScreen.slotBookableFrom'),
          item?.bookingStartsAt
            ? DateTime.fromJSDate(item?.bookingStartsAt).toFormat('d MMMM yyyy')
            : ' - ',
        ].join(' ')}
      />
    ) : (
      <EmptyState
        icon={faHourglassEnd}
        iconSize={fontSizes['4xl']}
        message={t('bookingSeatScreen.deadlineExpired')}
      />
    );
  };

  return (
    <View style={styles.container}>
      <HeaderAccessory
        justify="space-between"
        align="center"
        style={styles.header}
      >
        <View style={styles.headerLeft} />
        <Text style={styles.modalTitle}>{t('common.booking')}</Text>
        <IconButton icon={faTimes} onPress={close} adjustSpacing="left" />
      </HeaderAccessory>
      {canBeBooked && item.id ? (
        <>
          <View style={styles.spacer} />
          <BookingSeatsCta
            slotId={item.id?.toString()}
            hasSeats={item.hasSeats}
            absolute={false}
            modal={true}
          >
            <Row gap={4} style={styles.recapContainer}>
              <BookingField
                icon={faClock}
                label={t('common.hour')}
                value={`${startHour} - ${endHour}`}
              />
              <BookingField
                icon={faCalendar}
                value={day}
                label={t('common.day')}
              />
            </Row>
          </BookingSeatsCta>
        </>
      ) : (
        <NotBookableMessage />
      )}
    </View>
  );
};

const createStyles = ({
  colors,
  fontSizes,
  fontWeights,
  spacing,
  shapes,
}: Theme) =>
  StyleSheet.create({
    spacer: {
      height: spacing[6],
    },
    recapContainer: {
      marginHorizontal: spacing[4],
    },
    container: {
      backgroundColor: colors.surface,
      borderTopRightRadius: shapes.md,
      borderTopLeftRadius: shapes.md,
    },
    header: {
      borderTopRightRadius: shapes.md,
      borderTopLeftRadius: shapes.md,
      paddingVertical: spacing[1],
    },
    headerLeft: { padding: spacing[3] },
    modalTitle: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      color: colors.prose,
    },
  });
