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
        replyId: replyId ?? 0,
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
      <TouchableOpacity onPress={onPressAttachment} style={styles.container}>
        <AttachmentChip
          attachment={{
            name: attachment.filename,
            size: attachment.sizeInKiloBytes,
            uri: null,
            type: attachment.mimeType,
          }}
          loading={
            isDownloadingReplyAttachment || isDownloadingTicketAttachment
          }
        />
      </TouchableOpacity>
    </ThemeContext.Provider>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      maxWidth: '100%',
      marginTop: spacing[4],
    },
  });
