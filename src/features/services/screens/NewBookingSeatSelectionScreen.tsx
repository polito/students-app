import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faFrown } from '@fortawesome/free-regular-svg-icons';
import {
  faHourglassEnd,
  faHourglassStart,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { IconButton } from '@lib/ui/components/IconButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetBookingSeats } from '../../../core/queries/bookingHooks';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<
  ServiceStackParamList,
  'NewBookingSeatSelection'
>;

export const NewBookingSeatSelectionScreen = ({ route, navigation }: Props) => {
  const { slotId, topicId } = route.params;
  const { t } = useTranslation();
  const seats = useGetBookingSeats(topicId, slotId);

  console.debug('seats', seats.data);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          adjustSpacing="right"
          icon={faTimes}
          onPress={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <EmptyState
        icon={faHourglassEnd}
        message={t('bookingSeatScreen.deadlineExpired')}
      />
      <EmptyState
        icon={faHourglassStart}
        message={t('bookingSeatScreen.slotBookableFrom')}
      />
      <EmptyState
        icon={faFrown}
        message={t('bookingSeatScreen.noSeatsAvailable')}
      />
    </ScrollView>
  );
};
