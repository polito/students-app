import { useTranslation } from 'react-i18next';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DeadlineItem } from '../types/AgendaItem';

interface Props {
  item: DeadlineItem;
  compact?: boolean;
}

export const DeadlineCard = ({ item, compact = false }: Props) => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <AgendaCard
      date={item?.date}
      title={item.title}
      type={t('common.deadline')}
      color={colors.deadlineCardBorder}
      isCompact={compact}
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
