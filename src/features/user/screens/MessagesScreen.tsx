import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useTranslation } from 'react-i18next';
import { Pressable, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { Swipeable, SwipeableProvider } from '@lib/ui/components/Swipeable';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { BottomBarSpacer } from '~/core/components/BottomBarSpacer.tsx';
import {
  useDeleteMessage,
  useGetMessages,
} from '~/core/queries/studentHooks.ts';

import { MessageListItem } from '../components/MessageListItem';

export const MessagesScreen = () => {
  const { spacing, colors, palettes } = useTheme();
  const messagesQuery = useGetMessages();
  const { mutateAsync: deleteMessage } = useDeleteMessage();

  const { isLoading, data: messages } = messagesQuery;
  const { t } = useTranslation();

  const handleDelete = async (messageId: number) => {
    await deleteMessage(messageId);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[messagesQuery]} manual />}
    >
      <SafeAreaView>
        <GestureHandlerRootView>
          <SwipeableProvider>
            <Section style={{ marginTop: spacing['2'] }}>
              <OverviewList
                loading={isLoading}
                emptyStateText={t('messagesScreen.empty')}
              >
                {messages?.map((message, index) => (
                  <Swipeable
                    key={message.id}
                    rightAction={
                      <Pressable
                        style={[
                          styles.deleteButton,
                          { backgroundColor: palettes.error[500] },
                        ]}
                        onPress={() => handleDelete(message.id)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          color={colors.white}
                          size={20}
                        />
                      </Pressable>
                    }
                  >
                    <MessageListItem
                      messageItem={message}
                      index={index}
                      totalData={messages.length}
                    />
                  </Swipeable>
                ))}
              </OverviewList>
            </Section>
          </SwipeableProvider>
        </GestureHandlerRootView>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    height: '100%',
  },
});
