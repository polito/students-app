import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { LectureItem } from '../types/AgendaItem';

interface Props {
  item: LectureItem;
}

export const LectureCard = ({ item }: Props) => {
  const { navigate } = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { colors } = useTheme();

  return (
    <AgendaCard
      title={item.title}
      type={t('common.lecture')}
      time={`${item.fromTime} - ${item.toTime}`}
      location={item.place?.name ?? '-'}
      iconColor={item.color}
      color={colors.agendaLecture}
      icon={item.icon}
      onPress={() =>
        navigate({
          name: 'Lecture',
          params: {
            item,
          },
        })
      }
    >
      {item.description && (
        <Text
          variant="secondaryText"
          style={styles.description}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.description}
        </Text>
      )}
    </AgendaCard>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    description: {
      marginTop: spacing[1.5],
    },
  });
