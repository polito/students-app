import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { TicketAttachment } from '@polito/api-client/models/TicketAttachment';

import {
  useGetTicketAttachments,
  useGetTicketReplyAttachments,
} from '../../../core/queries/ticketHooks';

interface AttachmentCardProps {
  attachment?: TicketAttachment;
  replyId?: number;
  ticketId: number;
}

export const AttachmentCard = ({
  attachment,
  ticketId,
  replyId,
}: AttachmentCardProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [enabled, setEnabled] = useState<'reply' | 'ticket'>(null);
  const {
    data: replyAttachment,
    isLoading: isLoadingReply,
    isSuccess: isSuccessReply,
  } = useGetTicketReplyAttachments(
    {
      replyId,
      ticketId,
      attachmentId: attachment?.id,
    },
    enabled === 'reply' && !!attachment?.id && !!replyId,
  );

  const {
    data: ticketAttachments,
    isLoading: isLoadingTicket,
    isSuccess: isSuccessTicket,
  } = useGetTicketAttachments(
    {
      ticketId,
      attachmentId: attachment?.id,
    },
    enabled === 'reply' && !!attachment?.id,
  );

  const loading = isLoadingReply || isLoadingTicket;

  const onPressAttachment = () => {
    if (ticketId && attachment?.id && replyId) {
      setEnabled('reply');
    }
    if (ticketId && attachment?.id) {
      setEnabled('ticket');
    }
  };

  useEffect(() => {
    if (isSuccessReply) {
      console.debug({ replyAttachment });
      setEnabled(null);
    }
  }, [isSuccessReply]);

  useEffect(() => {
    if (isSuccessTicket) {
      console.debug({ ticketAttachments });
      setEnabled(null);
    }
  }, [isSuccessTicket]);

  if (!attachment) {
    return <View />;
  }

  return (
    <Row noFlex style={styles.attachmentContainer} onPress={onPressAttachment}>
      {loading ? (
        <View>
          {' '}
          <ActivityIndicator />{' '}
        </View>
      ) : (
        <Icon icon={faFile} size={35} />
      )}
      <Col noFlex flexStart>
        <Text numberOfLines={1} style={styles.name}>
          {attachment?.filename}
        </Text>
      </Col>
    </Row>
  );
};

const createStyles = ({
  colors,
  shapes,
  spacing,
  fontSizes,
  fontWeights,
}: Theme) =>
  StyleSheet.create({
    attachmentContainer: {
      borderRadius: shapes.lg * 1.5,
      backgroundColor: colors.text['200'],
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: spacing[2],
      paddingBottom: spacing[2],
      paddingTop: spacing[5],
      paddingRight: spacing[6],
      marginRight: spacing[3],
    },
    name: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    size: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
    },
  });
