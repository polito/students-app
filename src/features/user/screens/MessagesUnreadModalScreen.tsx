import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import {
  faCheckCircle,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Message } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useScreenReader } from '../../../core/hooks/useScreenReader';
import {
  useGetMessages,
  useMarkMessageAsRead,
} from '../../../core/queries/studentHooks';
import { unreadMessages } from '../../../utils/messages';
import { MessageItem } from '../components/MessageItem';
import { UserStackParamList } from '../components/UserNavigator';

type Props = NativeStackScreenProps<UserStackParamList, 'MessagesUnRead'>;

export const MessagesUnreadModalScreen = ({ navigation }: Props) => {
  const { refetch: getMessages } = useGetMessages(false);
  const { mutate } = useMarkMessageAsRead();
  const { t } = useTranslation();
  const [messagesToRead, setMessagesToRead] = useState<Message[]>([]);
  const [messagesReadCount, setMessageReadCount] = useState(0);
  const messagesToReadCount = messagesToRead?.length || 0;
  const isLastMessageToRead = messagesReadCount + 1 === messagesToReadCount;
  const { isScreenReaderEnabled, announce } = useScreenReader();

  useEffect(() => {
    getMessages().then(({ data }) => {
      setMessagesToRead(unreadMessages(data || []));
      isScreenReaderEnabled().then(isEnabled => {
        if (isEnabled) {
          announce(
            t('messagesScreen.youHaveunreadMessages', {
              total: unreadMessages(data || [])?.length || 0,
            }),
          );
        }
      });
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t('messagesScreen.unreadMessages', {
        read: messagesReadCount + 1,
        total: messagesToReadCount,
      }),
    });
  }, [t, messagesToRead, messagesReadCount]);

  const currentMessage = messagesToRead?.[messagesReadCount];

  const onConfirm = () => {
    mutate(currentMessage?.id);
    if (isLastMessageToRead) {
      navigation.goBack();
    } else {
      setMessageReadCount(messagesReadCount + 1);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {currentMessage && <MessageItem message={currentMessage} modal />}
      <CtaButton
        containerStyle={{ width: '100%' }}
        absolute
        title={t(
          isLastMessageToRead
            ? 'messagesScreen.end'
            : 'messagesScreen.readNext',
        )}
        action={onConfirm}
        icon={isLastMessageToRead ? faCheckCircle : faChevronRight}
      />
    </ScrollView>
  );
};
