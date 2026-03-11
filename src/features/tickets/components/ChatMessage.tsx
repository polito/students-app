import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChatBubble } from '@lib/ui/components/ChatBubble';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { TicketReply } from '@polito/student-api-client';

import { HtmlMessage } from './HtmlMessage';
import { TicketAttachmentChip } from './TicketAttachmentChip';

interface ChatMessageProps {
  received: boolean;
  message: TicketReply;
  ticketId: number;
}

type TicketReplyWithAi = TicketReply & { isAiAgent?: boolean };

export const ChatMessage = ({
  received,
  message,
  ticketId,
}: ChatMessageProps) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const reply = message as TicketReplyWithAi;

  const messageFirstPart = !message.agentId
    ? t('ticketScreen.incomingMessage')
    : reply.isAiAgent
      ? t('ticketScreen.virtualOperator')
      : [t('ticketScreen.outgoingMessage'), message.agentId].join(', ');
  const accessibilityMessageText = [messageFirstPart, message.message].join(
    ', ',
  );

  const Attachments = useCallback(
    () =>
      message.attachments?.length ? (
        <View style={styles.attachmentContainer}>
          {message.attachments.map((item, index) => {
            return (
              <TicketAttachmentChip
                key={index}
                attachment={item}
                ticketId={ticketId}
                replyId={message.id}
              />
            );
          })}
        </View>
      ) : null,
    [styles, message, ticketId],
  );

  return (
    <Pressable
      accessibilityRole="text"
      accessibilityLabel={accessibilityMessageText}
    >
      <ChatBubble
        accessibilityRole="text"
        accessibilityLabel={accessibilityMessageText}
        direction={received ? 'incoming' : 'outgoing'}
        time={message.createdAt}
        style={styles.bubbleContainer}
      >
        {message.agentId && (
          <Text style={styles.agentText}>
            {reply.isAiAgent
              ? t('ticketScreen.virtualOperator')
              : [t('common.agent'), message.agentId].join(' ')}
          </Text>
        )}
        <HtmlMessage
          message={message.message?.trim() ?? ''}
          baseStyle={styles.text}
        />
        <Attachments />
      </ChatBubble>
    </Pressable>
  );
};

const createStyles = ({ fontWeights, spacing, fontSizes, colors }: Theme) =>
  StyleSheet.create({
    // Theme-independent hardcoded color
    // eslint-disable-next-line react-native/no-color-literals
    agentText: {
      color: 'white',
      fontWeight: fontWeights.semibold,
      marginBottom: spacing[2],
    },
    attachmentContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    bubbleContainer: {
      marginHorizontal: spacing[5],
    },
    text: {
      padding: 0,
      fontSize: fontSizes.sm,
      color: colors.white,
      textDecorationColor: colors.white,
    },
  });
