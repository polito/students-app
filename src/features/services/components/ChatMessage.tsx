import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { TicketReply } from '@polito/api-client/models/TicketReply';

import { AttachmentCard } from './AttachmentCard';
import { TextMessage } from './TextMessage';
import { TimeWidget } from './TimeWidget';

interface ChatMessageProps {
  received?: boolean;
  message: TicketReply;
  ticketId: number;
}

export const ChatMessage = ({
  received,
  message,
  ticketId,
}: ChatMessageProps) => {
  const styles = useStylesheet(createStyles);
  const hasAttachment = message?.attachments?.length > 0;
  const { t } = useTranslation();

  const Attachments = () => {
    return (
      <>
        {hasAttachment && (
          <View style={styles.attachmentContainer}>
            A
            {(message?.attachments ?? []).map(item => {
              return (
                <AttachmentCard
                  key={item.id?.toString()}
                  attachment={item}
                  ticketId={ticketId}
                  replyId={message.id}
                />
              );
            })}
          </View>
        )}
      </>
    );
  };

  if (received) {
    return (
      <View style={styles.containerMessage}>
        <TimeWidget time={message?.createdAt} />
        <View style={styles.leftMessage}>
          <Attachments />
          {!!message?.agentId && (
            <Text style={styles.agentText}>
              #{t('common.agent')} {message.agentId}
            </Text>
          )}
          <TextMessage message={message?.message || ''} />
          <View style={styles.leftArrow} />
          <View style={styles.leftArrowOverlap} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerMessage}>
      <TimeWidget time={message?.createdAt} right />
      <View style={styles.rightMessage}>
        <Attachments />
        <TextMessage message={message?.message || ''} />
        <View style={styles.rightArrow} />
        <View style={styles.rightArrowOverlap} />
      </View>
    </View>
  );
};

const createStyles = ({ colors, shapes, spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    section: {
      marginVertical: spacing[2],
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    containerMessage: {
      marginTop: spacing['1.5'],
    },
    agentText: {
      color: colors.primary[800],
    },
    attachmentContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    messageText: {
      fontSize: fontSizes.sm,
      color: 'white',
      justifyContent: 'center',
    },
    rightArrow: {
      position: 'absolute',
      backgroundColor: colors.primary[400],
      width: spacing[5],
      height: +spacing[6],
      bottom: 0,
      borderBottomLeftRadius: +spacing[6],
      right: -spacing['2.5'],
    },
    rightArrowOverlap: {
      position: 'absolute',
      backgroundColor: colors.background,
      width: spacing[5],
      height: 35,
      bottom: -spacing[2],
      borderBottomLeftRadius: +spacing[5],
      right: -spacing[5],
    },
    rightMessage: {
      backgroundColor: colors.primary[400],
      padding: spacing['2.5'],
      borderRadius: shapes.lg,
      marginRight: spacing[5],
      width: '70%',
      marginTop: spacing['1'],
      alignSelf: 'flex-end',
    },
    leftMessage: {
      backgroundColor: colors.primary[200],
      padding: spacing['2.5'],
      paddingTop: spacing[2],
      borderRadius: shapes.lg,
      marginTop: spacing['1'],
      marginLeft: spacing[5],
      width: '70%',
      alignSelf: 'flex-start',
    },
    leftArrow: {
      position: 'absolute',
      backgroundColor: colors.primary[200],
      width: 20,
      height: 25,
      bottom: 0,
      borderBottomRightRadius: 25,
      left: -10,
    },
    leftArrowOverlap: {
      position: 'absolute',
      backgroundColor: colors.background,
      width: 20,
      height: 35,
      bottom: -6,
      borderBottomRightRadius: 18,
      left: -20,
    },
  });
