import { StyleSheet, View } from 'react-native';

import { ChatBubble } from '@lib/ui/components/ChatBubble';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { TicketReply } from '@polito/api-client/models/TicketReply';

import { AttachmentCard } from './AttachmentCard';
import { TextMessage } from './TextMessage';

interface ChatMessageProps {
  received: boolean;
  message: TicketReply;
  ticketId: number;
}

export const ChatMessage = ({
  received,
  message,
  ticketId,
}: ChatMessageProps) => {
  const styles = useStylesheet(createStyles);
  const hasAttachment = message.attachments?.length > 0;

  const Attachments = () => {
    if (hasAttachment) {
      return (
        <View style={styles.attachmentContainer}>
          {message.attachments.map((item, index) => {
            return (
              <AttachmentCard
                key={index}
                attachment={item}
                ticketId={ticketId}
                replyId={message.id}
              />
            );
          })}
        </View>
      );
    }
    return null;
  };

  return (
    <ChatBubble
      direction={received ? 'incoming' : 'outgoing'}
      time={message.createdAt}
      style={styles.bubbleContainer}
    >
      <TextMessage message={message.message?.trim() ?? ''} />
      <Attachments />
    </ChatBubble>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    bubbleContainer: {
      marginHorizontal: spacing[5],
    },
    attachmentContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  });
