import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import Barcode from 'react-native-barcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';

import { Card } from '@lib/ui/components/Card';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { Separator } from '@lib/ui/components/Separator';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { EventDetails } from '../../../core/components/EventDetails';
import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { weekDay } from '../../../utils';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Booking'>;

export const BookingScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const bookingsQuery = useGetBookings();
  const studentQuery = useGetStudent();
  const styles = useStylesheet(createStyles);
  const booking = bookingsQuery.data?.data.find(e => e.id === id);

  const title = booking?.topic?.title;
  const timeLabel = useMemo(() => {
    const fromDate = DateTime.fromISO(booking.startsAt.toISOString()).toFormat(
      'HH:mm',
    );
    const toDate = DateTime.fromISO(booking.endsAt.toISOString()).toFormat(
      'HH:mm',
    );
    return `${weekDay(booking.startsAt, t)},  ${fromDate} - ${toDate}`;
  }, [booking]);

  const onPressLocation = () => {
    console.log('onPressLocation');
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: bottomBarAwareStyles.paddingBottom + 40,
        }}
        refreshControl={createRefreshControl(bookingsQuery)}
        style={styles.wrapper}
      >
        <EventDetails title={title} type={t('Booking')} timeLabel={timeLabel} />
        <SectionList>
          <ListItem
            leadingItem={
              <Icon
                name="location"
                style={{ color: colors.secondaryText, marginRight: spacing[2] }}
                size={fontSizes['2xl']}
              />
            }
            title={booking.location.name}
            subtitle={booking.location.type}
            onPress={onPressLocation}
          />
        </SectionList>
        <Section style={styles.sectionSeparator}>
          <Separator />
          <Text variant={'caption'}>{t('Barcode')}</Text>
        </Section>
        <Section style={styles.sectionContainer}>
          <Card style={styles.barCodeCard} rounded>
            <Barcode
              value={studentQuery.data.data.username}
              format="CODE128"
              height={85}
              lineColor={colors.primary[800]}
              singleBarWidth={1.8}
              backgroundColor={'white'}
            />
          </Card>
        </Section>
      </ScrollView>
    </>
  );
};

const createStyles = ({ spacing, colors, size }: Theme) =>
  StyleSheet.create({
    barcode: {},
    barCodeCard: {
      width: '100%',
      padding: size.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: size.md,
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    sectionSeparator: {
      paddingHorizontal: size.lg,
      marginTop: size.xs,
    },
    sectionContainer: {
      paddingHorizontal: size.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      marginTop: size.xs,
      // padding: size.sm,
    },
    booking: {
      color: colors.primary[400],
      textTransform: 'uppercase',
      marginVertical: size.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
