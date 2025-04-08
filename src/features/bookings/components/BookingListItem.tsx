import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { Booking } from '@polito/api-client';

import { DateTime, IANAZone } from 'luxon';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { getHtmlTextContent } from '../../../utils/html';
import { BookingDateTime } from './BookingDateTime';

interface Props {
  booking: Booking;
  index: number;
  totalData: number;
}

export const BookingListItem = ({ booking, index, totalData }: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { accessibilityListLabel } = useAccessibility();
  const date = DateTime.fromJSDate(booking?.startsAt, {
    zone: IANAZone.create('Europe/Rome'),
  }).toFormat('dd MMMM');
  const startsAtTime = DateTime.fromJSDate(booking?.startsAt, {
    zone: IANAZone.create('Europe/Rome'),
  }).toFormat('HH:mm');
  const endAtTime = DateTime.fromJSDate(booking?.endsAt, {
    zone: IANAZone.create('Europe/Rome'),
  }).toFormat('HH:mm');

  const accessibilityLabel = accessibilityListLabel(index, totalData);
  const title = getHtmlTextContent(booking?.topic?.title ?? '');

  return (
    <ListItem
      title={title}
      titleStyle={styles.title}
      linkTo={{
        screen: 'Booking',
        params: {
          id: booking?.id,
        },
      }}
      accessibilityRole="button"
      subtitle={<BookingDateTime booking={booking} inListItem={true} />}
      accessibilityLabel={[
        accessibilityLabel,
        title,
        date,
        t('common.hour'),
        `${startsAtTime} - ${endAtTime}`,
      ].join(', ')}
      subtitleStyle={styles.subtitle}
    />
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights, palettes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    subtitle: {
      color: palettes.text['500'],
      fontWeight: fontWeights.medium,
      textTransform: 'capitalize',
      fontSize: fontSizes.sm,
      marginTop: spacing[0.5],
    },
  });
