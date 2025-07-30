import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  faCheckCircle,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { Message } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useHideTabs } from '../../../core/hooks/useHideTabs';
import { useScreenReader } from '../../../core/hooks/useScreenReader';
import {
  useGetModalMessages,
  useInvalidateMessages,
  useMarkMessageAsRead,
} from '../../../core/queries/studentHooks';
import { MessageScreenContent } from '../components/MessageScreenContent';
import { MfaAuthScreen } from './MfaAuthScreen';
import { MfaEnrollScreen } from './MfaEnrollScreen';

type Props = NativeStackScreenProps<
  any,
  'MessagesModal' | 'MfaModal' | 'MfaModalAuth'
>;

export const UnreadMessagesModal = ({ navigation, route }: Props) => {
  const { data: messages } = useGetModalMessages();
  const invalidateMessages = useInvalidateMessages();
  const { mutate } = useMarkMessageAsRead(false);
  const { t } = useTranslation();
  const [messagesToRead, setMessagesToRead] = useState<Message[]>([]);
  const [messagesReadCount, setMessageReadCount] = useState(0);
  const messagesToReadCount = messagesToRead?.length || 0;
  const isLastMessageToRead = messagesReadCount + 1 === messagesToReadCount;
  const { isScreenReaderEnabled, announce } = useScreenReader();
  const styles = useStylesheet(createStyles);

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
    if (route.params?.mfa?.status !== 'available')
      navigation.setOptions({
        headerTitle: t('mfaScreen.headerTitle'),
        headerTitleAlign: 'center',
      });
  }, [
    t,
    messagesToRead,
    messagesReadCount,
    navigation,
    messagesToReadCount,
    route.params?.mfa?.status,
  ]);

  useHideTabs(undefined, () => invalidateMessages.run());

  const currentMessage = messagesToRead?.[messagesReadCount];

  const onConfirm = () => {
    mutate(currentMessage?.id);
    if (isLastMessageToRead) {
      navigation.goBack();
    } else {
      setMessageReadCount(messagesReadCount + 1);
    }
  };
  return route.params?.mfa?.status === 'available' ? (
    // Solo uno child: eliminato il fragment
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <MfaEnrollScreen />
    </ScrollView>
  ) : route.params?.nonce !== undefined ? (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <MfaAuthScreen expirationTs={route.params.expirationTs} />
    </ScrollView>
  ) : (
    // Due child, qui il fragment serve ancora
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {currentMessage && (
          <MessageScreenContent message={currentMessage} modal />
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <CtaButton
          absolute={false}
          title={t(
            isLastMessageToRead
              ? 'messagesScreen.end'
              : 'messagesScreen.readNext',
          )}
          action={onConfirm}
          icon={isLastMessageToRead ? faCheckCircle : faChevronRight}
        />
      </View>
    </>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    buttonContainer: {
      paddingVertical: spacing[2],
    },
  });
