import { useTranslation } from 'react-i18next';

import { ListItem } from '@lib/ui/components/ListItem';
import { Message } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DateTime, IANAZone } from 'luxon';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useMarkMessageAsRead } from '../../../core/queries/studentHooks';
import { formatDateTime } from '../../../utils/dates';
import { getHtmlTextContent } from '../../../utils/html';
import { UserStackParamList } from './UserNavigator';

interface Props {
  messageItem: Message;
  index: number;
  totalData: number;
  isSwiping: boolean;
}

export const MessageListItem = ({
  messageItem,
  index,
  totalData,
  isSwiping,
}: Props) => {
  const { t } = useTranslation();
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { accessibilityListLabel } = useAccessibility();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const accessibilityLabel = accessibilityListLabel(index, totalData);
  const title = getHtmlTextContent(messageItem?.title);
  const sentAt = formatDateTime(messageItem.sentAt);
  const accessibleDate = DateTime.fromJSDate(messageItem?.sentAt, {
    zone: IANAZone.create('Europe/Rome'),
  }).toFormat('dd MMMM yyyy HH:mm');

  const onPressItem = () => {
    if (isSwiping) return;

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
      isAction={true}
      onPress={onPressItem}
      accessibilityLabel={[
        accessibilityLabel,
        title,
        t('messagesScreen.sentAt'),
        accessibleDate,
        t('messagesScreen.clickToNavigate'),
      ].join(', ')}
      subtitle={sentAt}
    />
  );
};
