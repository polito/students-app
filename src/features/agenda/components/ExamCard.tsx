import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ExamItem } from '../types/AgendaItem';

interface Props {
  item: ExamItem;
  compact?: boolean;
}

export const ExamCard = ({ item, compact = false }: Props) => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const location = useMemo(() => {
    const length = item.places?.length ?? 0;

    if (length === 0) return '-';
    if (length === 1)
      return t('agendaScreen.room', { roomName: item.places[0].name });

    return t('agendaScreen.rooms', {
      roomNames: item.places.map(place => place.name).join(', '),
    });
  }, [item.places, t]);
  return (
    <AgendaCard
      title={item.title}
      type={t('common.examCall')}
      color={colors.examCardBorder}
      isCompact={compact}
      iconColor={item.color}
      icon={item.icon}
      time={
        item.isTimeToBeDefined ? t('common.timeToBeDefined') : item.fromTime
      }
      location={location}
      onPress={() =>
        navigate({
          name: 'Exam',
          params: {
            id: item.id,
          },
        })
      }
    />
  );
};
