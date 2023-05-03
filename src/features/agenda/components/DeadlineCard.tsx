import { useTranslation } from 'react-i18next';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { DeadlineItem } from '../types/AgendaItem';

interface Props {
  item: DeadlineItem;
}

export const DeadlineCard = ({ item }: Props) => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <AgendaCard
      title={item.title}
      type={t('common.deadline')}
      color={colors.agendaDeadline}
      onPress={() =>
        navigate({
          name: 'Deadline',
          params: {
            item: item,
          },
        })
      }
    />
  );
};
