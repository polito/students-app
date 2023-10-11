import { ScrollView } from 'react-native';

import { Text } from '@lib/ui/components/Text';

import {
  useGetBookingSlots,
  useGetBookingTopics,
} from '../../../core/queries/bookingHooks';

export const NewBookingScreen = () => {
  const topicsQuery = useGetBookingTopics();
  const bookingsSlotsQuery = useGetBookingSlots('TEST_COORDINATE');

  console.debug('topicsQuery', topicsQuery?.data);
  console.debug('bookingsSlotsQuery', bookingsSlotsQuery?.data);

  return (
    <ScrollView>
      <Text></Text>
    </ScrollView>
  );
};
