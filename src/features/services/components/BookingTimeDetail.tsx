import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Booking } from '@polito/api-client';

import { DateTime } from 'luxon';

type Props = {
  booking: Booking;
};
export const BookingTimeDetail = ({ booking }: Props) => {
  const { spacing, palettes } = useTheme();
  const date = DateTime.fromJSDate(booking?.startsAt).toFormat('dd MMMM');
  const startsAtTime = DateTime.fromJSDate(booking?.startsAt).toFormat('HH:mm');
  const endAtTime = DateTime.fromJSDate(booking?.endsAt).toFormat('HH:mm');

  return (
    <Row style={{ marginTop: spacing[1] }}>
      <Icon
        icon={faCalendar}
        color={palettes.gray[500]}
        style={{ marginRight: spacing[1] }}
      />
      <Text style={{ color: palettes.gray[500], textTransform: 'capitalize' }}>
        {date}
      </Text>
      <Icon
        icon={faClock}
        color={palettes.gray[500]}
        style={{ marginLeft: spacing[3], marginRight: spacing[1.5] }}
      />
      <Text style={{ color: palettes.gray[500], textTransform: 'capitalize' }}>
        {startsAtTime} - {endAtTime}
      </Text>
    </Row>
  );
};
