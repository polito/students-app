import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { Message } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useMarkMessageAsRead } from '../../../core/queries/studentHooks';
import { formatDateTime } from '../../../utils/dates';
import { getHtmlTextContent } from '../../../utils/html';
import { UserStackParamList } from './UserNavigator';

interface Props {
  messageItem: Message;
  index: number;
  totalData: number;
}

export const MessageListItem = ({ messageItem, index, totalData }: Props) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { accessibilityListLabel } = useAccessibility();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const accessibilityLabel = accessibilityListLabel(index, totalData);
  const title = getHtmlTextContent(messageItem?.title);
  const sentAt = formatDateTime(messageItem.sentAt);

  const onPressItem = () => {
    if (!messageItem.isRead) {
      markAsRead(messageItem.id);
    }
    navigation.navigate('Message', {
      id: messageItem.id,
    });
  };

  return (
    <ListItem
      unread={!messageItem.isRead}
      title={title}
      titleStyle={styles.title}
      onPress={onPressItem}
      accessibilityLabel={[
        accessibilityLabel,
        title,
        t('messagesScreen.sentAt'),
        sentAt,
      ].join(', ')}
      subtitle={sentAt}
      subtitleStyle={styles.subtitle}
      trailingItem={
        <Icon
          icon={faChevronRight}
          color={colors.secondaryText}
          style={styles.icon}
        />
      }
    />
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights, palettes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold,
    },
    subtitle: {
      color: palettes.text['500'],
      fontWeight: fontWeights.normal,
      fontSize: fontSizes.sm,
      marginTop: spacing[0.5],
    },
    icon: {
      marginRight: -spacing[1],
    },
  });
