import { ScreenDateTime } from '@lib/ui/components/ScreenDateTime';
import { Booking } from '@polito/api-client';

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
  return (
    <ScreenDateTime
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
