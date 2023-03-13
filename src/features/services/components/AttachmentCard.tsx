import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { open } from 'react-native-file-viewer';

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
  useGetTicketAttachment,
  useGetTicketReplyAttachment,
} from '../../../core/queries/ticketHooks';
import { formatFileSize } from '../../../utils/files';

interface AttachmentCardProps {
  attachment: TicketAttachment;
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
  const [shouldOpen, setShouldOpen] = useState<boolean>(false);
  const isReply = useMemo(() => replyId !== undefined, [replyId]);

  const { isFetching: isDownloadingReplyAttachment, data: replyAttachment } =
    useGetTicketReplyAttachment(
      {
        replyId,
        ticketId,
        attachmentId: attachment.id,
      },
      attachment.filename,
      isReply && shouldOpen,
    );

  const { isFetching: isDownloadingTicketAttachment, data: ticketAttachment } =
    useGetTicketAttachment(
      {
        ticketId,
        attachmentId: attachment.id,
      },
      attachment.filename,
      !isReply && shouldOpen,
    );

  const onPressAttachment = () => setShouldOpen(true);

  useEffect(() => {
    if (!shouldOpen || !ticketAttachment) return;
    open(ticketAttachment);
    setShouldOpen(false);
  }, [shouldOpen, ticketAttachment]);

  useEffect(() => {
    if (!shouldOpen || !replyAttachment) return;
    open(replyAttachment);
    setShouldOpen(false);
  }, [shouldOpen, replyAttachment]);

  return (
    <TouchableOpacity onPress={onPressAttachment}>
      <Row noFlex style={styles.attachmentContainer}>
        {isDownloadingReplyAttachment || isDownloadingTicketAttachment ? (
          <View style={styles.loaderView}>
            <ActivityIndicator color={colors.primary[50]} />
          </View>
        ) : (
          <Icon icon={faFile} size={25} color={'white'} />
        )}
        <Col noFlex flexStart style={styles.textContainer}>
          <Text style={styles.name}>{attachment.filename}</Text>
          <Text numberOfLines={1} style={styles.size}>
            {formatFileSize(attachment.sizeInKiloBytes, 0)}
          </Text>
        </Col>
      </Row>
    </TouchableOpacity>
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights }: Theme) =>
  StyleSheet.create({
    attachmentContainer: {
      alignItems: 'center',
      paddingTop: spacing[3],
    },
    loaderView: {
      width: 25,
    },
    textContainer: {
      paddingLeft: spacing[1],
    },
    name: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: 'white',
      paddingRight: spacing[5],
    },
    size: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      color: 'white',
    },
  });
