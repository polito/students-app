import { StyleSheet } from 'react-native';

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { Booking } from '@polito/api-client';

import { DateTime } from 'luxon';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { getHtmlTextContent } from '../../../utils/html';
import { BookingTimeDetail } from './BookingTimeDetail';

interface Props {
  booking: Booking;
  index: number;
  totalData: number;
}

export const BookingListItem = ({ booking, index, totalData }: Props) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { accessibilityListLabel } = useAccessibility();
  const date = DateTime.fromJSDate(booking?.startsAt).toFormat('dd MMMM');
  const startsAtTime = DateTime.fromJSDate(booking?.startsAt).toFormat('HH:mm');
  const endAtTime = DateTime.fromJSDate(booking?.endsAt).toFormat('HH:mm');

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
      subtitle={<BookingTimeDetail booking={booking} accessible={false} />}
      accessibilityLabel={[
        accessibilityLabel,
        title,
        date,
        `${startsAtTime} - ${endAtTime}`,
      ].join(', ')}
      subtitleStyle={styles.subtitle}
      trailingItem={
        <Icon
          icon={faChevronRight}
          color={colors.secondaryText}
          style={styles.icon}
        />
      }
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
    icon: {
      marginRight: -spacing[1],
    },
  });
