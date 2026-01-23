import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  faCheckCircle,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useHideTabs } from '../../../core/hooks/useHideTabs';
import { useScreenReader } from '../../../core/hooks/useScreenReader';
import {
  useGetModalMessages,
  useInvalidateMessages,
  useMarkMessageAsRead,
} from '../../../core/queries/studentHooks';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { MessageScreenContent } from '../components/MessageScreenContent';

type Props = NativeStackScreenProps<TeachingStackParamList, 'MessagesModal'>;

export const UnreadMessagesModal = ({ navigation }: Props) => {
  const { data: messages } = useGetModalMessages();
  const invalidateMessages = useInvalidateMessages();
  const { t } = useTranslation();
  const [messagesReadCount, setMessageReadCount] = useState(0);
  const messagesToReadCount = messages?.length || 0;
  const isLastMessageToRead = messagesReadCount + 1 === messagesToReadCount;
  const { mutate } = useMarkMessageAsRead(false);
  const { isScreenReaderEnabled, announce } = useScreenReader();
  const { spacing } = useTheme();
  const { bottom } = useSafeAreaInsets();

  const currentMessage = messages?.[messagesReadCount];
  const isExamMessage = currentMessage?.type === ('exams' as any);

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
    navigation.setOptions({
      headerTitle: t('messagesScreen.unreadMessages', {
        read: messagesReadCount + 1,
        total: messagesToReadCount,
      }),
    });
  }, [t, messagesReadCount, navigation, messagesToReadCount]);

  useHideTabs(undefined, () => invalidateMessages.run());

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

  const onViewProvisionalGrade = async () => {
    if (currentMessage) {
      await new Promise(ok => mutate(currentMessage.id, { onSettled: ok }));
    }

    navigation.goBack();
    navigation.navigate('Transcript');
  };

  const showExamButton = isExamMessage;
  const showNextButton = !isLastMessageToRead;
  const showEndButton = !isExamMessage && isLastMessageToRead;

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
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        {showExamButton && (
          <CtaButton
            absolute={false}
            tkey="messageScreen.viewProvisionalGrade"
            action={onViewProvisionalGrade}
            variant="filled"
            containerStyle={{ flex: 1 }}
          />
        )}

        {showNextButton && (
          <CtaButton
            absolute={false}
            tkey=""
            variant="outlined"
            action={onConfirm}
            icon={faChevronRight}
            style={{ paddingLeft: spacing[4], paddingRight: spacing[2] }}
          />
        )}

        {showEndButton && (
          <CtaButton
            absolute={false}
            tkey="messagesScreen.end"
            action={onConfirm}
            icon={faCheckCircle}
            containerStyle={{ flex: 1 }}
          />
        )}
      </View>
    </>
  );
};
