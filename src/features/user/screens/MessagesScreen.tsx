import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useTranslation } from 'react-i18next';
import { Pressable, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { BottomBarSpacer } from '~/core/components/BottomBarSpacer.tsx';
import {
  useDeleteMessage,
  useGetMessages,
} from '~/core/queries/studentHooks.ts';

import { MessageListItem } from '../components/MessageListItem';

function createRightAction(onDelete: () => void) {
  return (_: SharedValue<number>, drag: SharedValue<number>) => {
    const { colors, palettes } = useTheme();
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 88 }],
      };
    });

    return (
      <Reanimated.View style={styleAnimation}>
        <Pressable
          style={[
            styles.deleteButton,
            { backgroundColor: palettes.error[500] },
          ]}
          onPress={onDelete}
        >
          <FontAwesomeIcon icon={faTrash} color={colors.white} size={20} />
        </Pressable>
      </Reanimated.View>
    );
  };
}

export const MessagesScreen = () => {
  const { spacing } = useTheme();
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
          <Section style={{ marginTop: spacing['2'] }}>
            <OverviewList
              loading={isLoading}
              emptyStateText={t('messagesScreen.empty')}
            >
              {messages?.map((message, index) => (
                <ReanimatedSwipeable
                  key={message.id}
                  friction={2}
                  enableTrackpadTwoFingerGesture
                  rightThreshold={40}
                  overshootRight={false}
                  renderRightActions={createRightAction(() =>
                    handleDelete(message.id),
                  )}
                >
                  <Reanimated.View>
                    <MessageListItem
                      messageItem={message}
                      index={index}
                      totalData={messages.length}
                    />
                  </Reanimated.View>
                </ReanimatedSwipeable>
              ))}
            </OverviewList>
          </Section>
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
