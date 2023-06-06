import { useTranslation } from 'react-i18next';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BookingItem } from '../types/AgendaItem';

interface Props {
  item: BookingItem;
  compact?: boolean;
}

export const BookingCard = ({ item, compact = false }: Props) => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <AgendaCard
      title={item.title}
      type={t('common.booking')}
      color={colors.agendaBooking}
      compact={compact}
      time={`${item.fromTime} - ${item.toTime}`}
      onPress={() =>
        navigate({
          name: 'Booking',
          params: {
            id: item.id,
          },
        })
      }
    />
  );
};
