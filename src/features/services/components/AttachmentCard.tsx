import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { TicketAttachment } from '@polito/api-client/models/TicketAttachment';

import {
  useGetTicketAttachments,
  useGetTicketReplyAttachments,
} from '../../../core/queries/ticketHooks';
import { formatFileSize } from '../../../utils/files';

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
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const [enabled, setEnabled] = useState<'reply' | 'ticket'>(null);
  console.debug(enabled);
  const {
    data: replyAttachment,
    isFetching: isLoadingReply,
    isSuccess: isSuccessReply,
  } = useGetTicketReplyAttachments(
    {
      replyId,
      ticketId,
      attachmentId: attachment?.id,
    },
    enabled === 'reply' && !!attachment?.id.toString() && !!replyId,
  );

  const {
    data: ticketAttachments,
    isFetching: isLoadingTicket,
    isSuccess: isSuccessTicket,
  } = useGetTicketAttachments(
    {
      ticketId,
      attachmentId: attachment?.id,
    },
    enabled === 'ticket' && !!attachment?.id.toString(),
  );

  const loading = isLoadingReply || isLoadingTicket;

  const onPressAttachment = () => {
    console.debug({ ticketId, attachment, replyId });
    if (ticketId && !!attachment?.id.toString()) {
      console.debug('qui');
      setEnabled('ticket');
      console.debug({ enabled });
      return;
    }
    if (ticketId && !!attachment?.id.toString() && !!replyId) {
      setEnabled('reply');
    }
  };

  useEffect(() => {
    if (isSuccessReply) {
      console.debug('replyAttachment', replyAttachment);
      setEnabled(null);
    }
  }, [isSuccessReply]);

  useEffect(() => {
    if (isSuccessTicket) {
      console.debug('ticketAttachments', ticketAttachments);
      setEnabled(null);
    }
  }, [isSuccessTicket]);

  if (!attachment) {
    return <View />;
  }

  return (
    <Row
      noFlex
      style={styles.attachmentContainer}
      onPress={onPressAttachment}
      touchableOpacity
    >
      {loading ? (
        <View>
          <ActivityIndicator color={colors.primary[50]} />
        </View>
      ) : (
        <Icon icon={faFile} size={25} color={'white'} />
      )}
      <Col noFlex flexStart style={styles.textContainer}>
        <Text numberOfLines={1} style={styles.name}>
          {attachment?.filename}
        </Text>
        <Text numberOfLines={1} style={styles.size}>
          {formatFileSize(attachment?.sizeInKiloBytes, 0)}
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
      flexDirection: 'row',
      borderRadius: shapes.lg,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingBottom: spacing[1],
      marginBottom: spacing[1],
      width: '50%',
    },
    textContainer: {
      paddingLeft: spacing[1],
    },
    name: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: 'white',
    },
    size: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      color: 'white',
    },
  });
