import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import {
  faCheckCircle,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { Message } from '@polito/api-client';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useScreenReader } from '../../../core/hooks/useScreenReader';
import {
  useGetModalMessages,
  useInvalidateMessages,
  useMarkMessageAsRead,
} from '../../../core/queries/studentHooks';
import { MessageScreenContent } from '../components/MessageScreenContent';

type Props = NativeStackScreenProps<any, 'MessagesModal'>;

export const UnreadMessagesModal = ({ navigation }: Props) => {
  const { data: messages } = useGetModalMessages();
  const invalidateMessages = useInvalidateMessages();
  const { mutate } = useMarkMessageAsRead(false);
  const { t } = useTranslation();
  const [messagesToRead, setMessagesToRead] = useState<Message[]>([]);
  const [messagesReadCount, setMessageReadCount] = useState(0);
  const messagesToReadCount = messagesToRead?.length || 0;
  const isLastMessageToRead = messagesReadCount + 1 === messagesToReadCount;
  const { isScreenReaderEnabled, announce } = useScreenReader();

  useEffect(() => {
    if (!messages) return;

    setMessagesToRead(messages);
    isScreenReaderEnabled().then(isEnabled => {
      if (isEnabled) {
        announce(
          t('messagesScreen.youHaveUnreadMessages', {
            total: messages.length,
          }),
        );
      }
    });
  }, [announce, isScreenReaderEnabled, messages, t]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t('messagesScreen.unreadMessages', {
        read: messagesReadCount + 1,
        total: messagesToReadCount,
      }),
    });
  }, [t, messagesToRead, messagesReadCount, navigation, messagesToReadCount]);

  useFocusEffect(
    useCallback(() => {
      // Invalidate message list when the modal is closing
      return () => {
        invalidateMessages.run();
      };
    }, []),
  );

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
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {currentMessage && (
          <MessageScreenContent message={currentMessage} modal />
        )}
        <CtaButtonSpacer />
      </ScrollView>
      <CtaButton
        title={t(
          isLastMessageToRead
            ? 'messagesScreen.end'
            : 'messagesScreen.readNext',
        )}
        action={onConfirm}
        icon={isLastMessageToRead ? faCheckCircle : faChevronRight}
      />
    </>
  );
};
