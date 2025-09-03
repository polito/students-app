import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  faCheckCircle,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useHideTabs } from '../../../core/hooks/useHideTabs';
import { useScreenReader } from '../../../core/hooks/useScreenReader';
import {
  useGetModalMessages,
  useInvalidateMessages,
  useMarkMessageAsRead,
} from '../../../core/queries/studentHooks';
import { MessageScreenContent } from '../components/MessageScreenContent';

type Props = NativeStackScreenProps<any, 'MessagesModal'>;

export const UnreadMessagesModal = ({ navigation, route }: Props) => {
  const { data: messages } = useGetModalMessages();

  const invalidateMessages = useInvalidateMessages();
  const { t } = useTranslation();
  const [messagesReadCount, setMessageReadCount] = useState(0);
  const messagesToReadCount = messages?.length || 0;
  const isLastMessageToRead = messagesReadCount + 1 === messagesToReadCount;
  const { mutate } = useMarkMessageAsRead(false);
  const { isScreenReaderEnabled, announce } = useScreenReader();

  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (!messagesToReadCount) {
      navigation.goBack();
    }
  }, [messagesToReadCount, navigation]);

  useEffect(() => {
    isScreenReaderEnabled().then(isEnabled => {
      if (!isEnabled) return;
      announce(
        t('messagesScreen.youHaveUnreadMessages', {
          total: messagesToReadCount,
        }),
      );
    });
  }, [announce, isScreenReaderEnabled, t, messagesToReadCount]);

  useEffect(() => {
    if (route.params?.mfa?.status !== 'available')
      navigation.setOptions({
        headerTitle: t('mfaScreen.headerTitle'),
        headerTitleAlign: 'center',
      });
  }, [
    t,
    messagesReadCount,
    navigation,
    messagesToReadCount,
    route.params?.mfa?.status,
  ]);

  useHideTabs(undefined, () => invalidateMessages.run());

  const currentMessage = messages?.[messagesReadCount];

  const onConfirm = async () => {
    if (currentMessage) {
      await new Promise(ok => mutate(currentMessage.id, { onSettled: ok }));
    }
    if (isLastMessageToRead) {
      navigation.goBack();
    } else {
      setMessageReadCount(m => m + 1);
    }
  };
  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {currentMessage && (
          <MessageScreenContent message={currentMessage} modal />
        )}
      </ScrollView>
      <View
        style={{
          paddingVertical: bottom,
        }}
      >
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
