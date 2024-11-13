import { useTranslation } from 'react-i18next';

import { ScreenDateTime } from '@lib/ui/components/ScreenDateTime';
import { Booking } from '@polito/api-client';

import { DateTime, IANAZone } from 'luxon';

import { formatReadableDate, formatTime } from '../../../utils/dates';

interface Props {
  accessible?: boolean;
  booking?: Booking;
  inListItem?: boolean;
}
export const BookingDateTime = ({
  booking,
  accessible = false,
  inListItem = false,
}: Props) => {
  const { t } = useTranslation();

  const date = booking
    ? DateTime.fromJSDate(booking?.startsAt, {
        zone: IANAZone.create('Europe/Rome'),
      }).toFormat('dd MMMM')
    : '';
  const startsAtTime = booking
    ? DateTime.fromJSDate(booking?.startsAt, {
        zone: IANAZone.create('Europe/Rome'),
      }).toFormat('HH:mm')
    : '';
  const endAtTime = booking
    ? DateTime.fromJSDate(booking?.endsAt, {
        zone: IANAZone.create('Europe/Rome'),
      }).toFormat('HH:mm')
    : '';

  const accessibilityLabel = [
    date,
    t('common.hour'),
    `${startsAtTime} - ${endAtTime}`,
  ].join(', ');

  return (
    <ScreenDateTime
      accessibilityLabel={accessibilityLabel}
      accessible={accessible}
      date={booking?.startsAt && formatReadableDate(booking.startsAt)}
      time={
        booking?.startsAt &&
        `${formatTime(booking.startsAt)} - ${formatTime(booking.endsAt!)}`
      }
      inListItem={inListItem}
    />
  );
};
