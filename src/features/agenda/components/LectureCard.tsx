import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { AgendaCard } from '@lib/ui/components/AgendaCard';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp as NavigationProp } from '@react-navigation/native-stack';

import { LectureItem } from '../types/AgendaItem';
import { AgendaStackParamList as AgendaStack } from './AgendaNavigator';

interface Props {
  item: LectureItem;
  compact?: boolean;
  nextLecture?: boolean;
  nextDate?: string;
}

export const LectureCard = ({
  item,
  compact = false,
  nextLecture = false,
  nextDate,
}: Props) => {
  const { navigate } = useNavigation<NavigationProp<AgendaStack, 'Lecture'>>();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { colors, fontSizes, dark } = useTheme();
  const location = useMemo(() => {
    if (!item.place?.name) return '-';

    if (compact) return item.place.name;

    return t('agendaScreen.room', { roomName: item.place.name });
  }, [compact, item.place?.name, t]);

  return (
    <AgendaCard
      title={item.title}
      type={t('common.lecture')}
      time={`${item.fromTime} - ${item.toTime}`}
      location={location}
      iconColor={item.color}
      isCompact={compact}
      icon={item.icon}
      onPress={
        !nextLecture
          ? () =>
              navigate({
                name: 'Lecture',
                params: {
                  item,
                },
              })
          : undefined
      }
      style={[
        styles.card,
        { backgroundColor: item.color + (dark ? '80' : '30') },
      ]}
      nextLecture={nextLecture}
      nextDate={nextDate}
    >
      {item.virtualClassrooms?.map(vc => (
        <Row key={vc.id} align="center" style={styles.vcRow}>
          <Icon icon={faVideo} color={colors.prose} size={fontSizes.sm} />
          <Text variant="secondaryText" style={styles.vcTitle}>
            {vc.title}
          </Text>
        </Row>
      ))}
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

const createStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: 0,
      elevation: 0,
    },
    description: {
      color: colors.lectureCardSecondary,
      marginTop: spacing[1.5],
    },
    vcTitle: {
      color: colors.lectureCardSecondary,
      marginLeft: spacing[1.5],
    },
    vcRow: {
      padding: spacing[1],
    },
  });
