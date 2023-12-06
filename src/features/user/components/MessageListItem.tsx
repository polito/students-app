import { useTranslation } from 'react-i18next';

import { ListItem } from '@lib/ui/components/ListItem';
import { Message } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { usePushNotifications } from '../../../core/hooks/usePushNotifications';
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
  const { t } = useTranslation();
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { accessibilityListLabel } = useAccessibility();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const accessibilityLabel = accessibilityListLabel(index, totalData);
  const title = getHtmlTextContent(messageItem?.title);
  const sentAt = formatDateTime(messageItem.sentAt);
  const { decrementUnread } = usePushNotifications();

  const onPressItem = () => {
    if (!messageItem.isRead) {
      markAsRead(messageItem.id);
      decrementUnread(['messages']);
    }
    navigation.navigate('Message', {
      id: messageItem.id,
    });
  };

  return (
    <ListItem
      unread={!messageItem.isRead}
      title={title}
      isAction={true}
      onPress={onPressItem}
      accessibilityLabel={[
        accessibilityLabel,
        title,
        t('messagesScreen.sentAt'),
        sentAt,
      ].join(', ')}
      subtitle={sentAt}
    />
  );
};
