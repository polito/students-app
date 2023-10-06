import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetBookings } from '../../../core/queries/bookingHooks';
import { BookingListItem } from '../components/BookingListItem';

export const BookingsScreen = () => {
  const bookingsQuery = useGetBookings();
  const { t } = useTranslation();

  const onPressCreateBooking = () => {
    console.debug('onPressCreateBooking');
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl queries={[bookingsQuery]} manual />}
      >
        <SafeAreaView>
          <Section>
            <SectionHeader title={t('bookingsScreen.sectionTitle')} />
            <OverviewList loading={bookingsQuery.isLoading}>
              {bookingsQuery?.data?.map((booking, index) => (
                <BookingListItem
                  booking={booking}
                  key={booking.id}
                  index={index}
                  totalData={bookingsQuery.data?.length || 0}
                />
              ))}
            </OverviewList>
          </Section>
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
      <CtaButton
        action={onPressCreateBooking}
        title={t('bookingsScreen.newBooking')}
        icon={faPlus}
      />
    </>
  );
};
