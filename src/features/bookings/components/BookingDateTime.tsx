import { useTranslation } from 'react-i18next';

import { ScreenDateTime } from '@lib/ui/components/ScreenDateTime';
import { Booking } from '@polito/api-client';

import { dateFormatter, formatReadableDate } from '../../../utils/dates';

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
  const formatHHmm = dateFormatter('HH:mm');
  const formatddMMMM = dateFormatter('dd MMMM');

  const date = booking ? formatddMMMM(booking.startsAt) : '';
  const startsAtTime = booking ? formatHHmm(booking.startsAt) : '';
  const endAtTime = booking ? formatHHmm(booking?.endsAt) : '';

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
        `${formatHHmm(booking.startsAt)} - ${formatHHmm(booking.endsAt!)}`
      }
      inListItem={inListItem}
    />
  );
};
