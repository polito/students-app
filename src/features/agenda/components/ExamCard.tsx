import { useTranslation } from 'react-i18next';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ExamItem } from '../types/AgendaItem';

interface Props {
  item: ExamItem;
}

export const ExamCard = ({ item }: Props) => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <AgendaCard
      title={item.title}
      type={t('common.examCall')}
      color={colors.agendaExam}
      time={
        item.isTimeToBeDefined ? t('common.timeToBeDefined') : item.fromTime
      }
      location={item.classroom}
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
