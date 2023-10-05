import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Barcode from 'react-native-barcode-svg';

import { faLocation } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { Booking } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  useDeleteBooking,
  useGetBookings,
} from '../../../core/queries/bookingHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { BookingTimeDetail } from '../../services/components/BookingTimeDetail';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Booking'>;

export const BookingScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { setFeedback } = useFeedbackContext();

  const { colors, palettes, spacing } = useTheme();
  const bookingsQuery = useGetBookings();
  const bookingMutation = useDeleteBooking(id);
  const studentQuery = useGetStudent();
  const confirmCancel = useConfirmationDialog({
    title: t('bookingScreen.cancelBooking'),
    message: t('bookingScreen.cancelBookingText'),
  });
  const isDisabled = useOfflineDisabled();
  const styles = useStylesheet(createStyles);
  const booking = bookingsQuery.data?.find((e: Booking) => e.id === id);
  const title = booking?.topic?.title ?? '';
  const subTopicTitle = booking?.subtopic?.title ?? '';

  const showCheckIn = !!(
    booking?.locationCheck?.enabled && !booking?.locationCheck?.checked
  );
  const canBeCancelled =
    !!booking?.cancelableUntil &&
    DateTime.fromJSDate(booking?.cancelableUntil) > DateTime.now();

  const onPressLocation = () => {};

  const onPressCheckIn = () => {};

  const onPressDelete = async () => {
    if (await confirmCancel()) {
      console.debug('ok');
      // return bookingMutation
      //   .mutateAsync()
      //   .then(() => navigation.goBack())
      //   .then(() => setFeedback({ text: t('bookingScreen.cancelFeedback') }));
    }
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl manual queries={[bookingsQuery]} />}
      >
        <SafeAreaView>
          <View style={{ padding: spacing[5] }}>
            <ScreenTitle style={{ marginBottom: spacing[2] }} title={title} />
            {subTopicTitle && (
              <Text variant="caption" style={{ marginBottom: spacing[1] }}>
                {subTopicTitle}
              </Text>
            )}
            {booking && <BookingTimeDetail booking={booking} />}
          </View>
          {booking?.location?.name && (
            <OverviewList>
              <ListItem
                leadingItem={
                  <Icon
                    icon={faLocation}
                    size={20}
                    color={colors.secondaryText}
                    style={{ marginRight: spacing[2] }}
                  />
                }
                title={booking.location.name}
                subtitle={booking.location?.type}
                onPress={onPressLocation}
              />
            </OverviewList>
          )}
          <Section style={{ marginTop: spacing[4] }} mb={0}>
            <SectionHeader title={t('bookingScreen.barCodeTitle')} />
            <Card style={styles.barCodeCard} rounded>
              {studentQuery.data && (
                <Barcode
                  value={studentQuery.data.username}
                  format="CODE128"
                  height={85}
                  lineColor={palettes.primary[800]}
                  singleBarWidth={1.8}
                  backgroundColor="white"
                />
              )}
            </Card>
          </Section>
          {showCheckIn && (
            <CtaButton
              title={t('bookingScreen.checkIn')}
              action={onPressCheckIn}
              outlined
              absolute={false}
              disabled={isDisabled}
              loading={bookingMutation.isLoading}
            />
          )}
          <CtaButtonSpacer />
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      {canBeCancelled && (
        <CtaButton
          title={t('bookingScreen.cancelBooking')}
          action={onPressDelete}
          disabled={isDisabled}
          destructive={true}
          loading={bookingMutation.isLoading}
        />
      )}
    </>
  );
};

const createStyles = ({ spacing, palettes, fontSizes }: Theme) =>
  StyleSheet.create({
    barCodeCard: {
      padding: fontSizes.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: fontSizes.md,
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    sectionSeparator: {
      paddingHorizontal: fontSizes.lg,
      marginTop: fontSizes.xs,
    },
    sectionContainer: {
      paddingHorizontal: fontSizes.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    booking: {
      color: palettes.primary[400],
      textTransform: 'uppercase',
      marginVertical: fontSizes.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
