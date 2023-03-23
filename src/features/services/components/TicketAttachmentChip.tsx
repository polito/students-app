import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { open } from 'react-native-file-viewer';

import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { TicketAttachment } from '@polito/api-client/models/TicketAttachment';

import {
  useGetTicketAttachment,
  useGetTicketReplyAttachment,
} from '../../../core/queries/ticketHooks';
import { darkTheme } from '../../../core/themes/dark';
import { AttachmentChip } from './AttachmentChip';

interface TicketAttachmentChipProps {
  attachment: TicketAttachment;
  replyId?: number;
  ticketId: number;
}

export const TicketAttachmentChip = ({
  attachment,
  ticketId,
  replyId,
}: TicketAttachmentChipProps) => {
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
    <ThemeContext.Provider value={darkTheme}>
      <TouchableOpacity onPress={onPressAttachment}>
        <AttachmentChip
          fullWidth
          attachment={{
            name: attachment.filename,
            size: attachment.sizeInKiloBytes,
            uri: null,
            type: attachment.mimeType,
          }}
          loading={
            isDownloadingReplyAttachment || isDownloadingTicketAttachment
          }
          style={styles.chip}
        />
      </TouchableOpacity>
    </ThemeContext.Provider>
  );
};

const createStyles = ({ colors, spacing, fontSizes, fontWeights }: Theme) =>
  StyleSheet.create({
    attachmentContainer: {
      alignItems: 'center',
      paddingTop: spacing[3],
    },
    chip: {
      marginTop: spacing[4],
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
      color: colors.title,
      paddingRight: spacing[5],
    },
    size: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      color: colors.title,
    },
  });
