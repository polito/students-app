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
}

export const LectureCard = ({ item, compact = false }: Props) => {
  const { navigate } = useNavigation<NavigationProp<AgendaStack, 'Lecture'>>();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { colors, fontSizes } = useTheme();

  return (
    <AgendaCard
      title={item.title}
      type={t('common.lecture')}
      time={`${item.fromTime} - ${item.toTime}`}
      location={item.place?.name ?? '-'}
      iconColor={item.color}
      color={colors.agendaLecture}
      compact={compact}
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

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    description: {
      marginTop: spacing[1.5],
    },
    vcTitle: {
      marginLeft: spacing[1.5],
    },
    vcRow: {
      padding: spacing[1],
    },
  });
