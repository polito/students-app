import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard, ViewProps } from 'react-native';

import { useReplyToTicket } from '../../../core/queries/ticketHooks';
import { Attachment } from '../../services/types/Attachment';
import { MessagingView } from './MessagingView';

interface Props {
  disabled?: boolean;
  ticketId: number;
  onLayout?: ViewProps['onLayout'];
}

export const TicketMessagingView = ({
  disabled,
  ticketId,
  onLayout,
}: Props) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>('');
  const [attachment, setAttachment] = useState<Attachment>();

  const { mutateAsync: reply, isPending } = useReplyToTicket(ticketId);

  const onSend = useCallback(() => {
    if (isPending) return;
    reply({
      ticketId: ticketId,
      attachment: attachment as unknown as Blob,
      message: message.trim().replace(/\n/g, '<br>'),
    })
      .then(() => {
        setMessage('');
        setAttachment(undefined);
        Keyboard.dismiss();
      })
      .catch(() => {
        Alert.alert(t('common.error'), t('ticketScreen.sendError'));
      });
  }, [attachment, message, reply, t, ticketId, isPending]);

  return (
    <MessagingView
      message={message}
      onMessageChange={setMessage}
      attachment={attachment}
      onAttachmentChange={setAttachment}
      loading={isPending}
      disabled={disabled}
      onLayout={onLayout}
      onSend={onSend}
      numberOfLines={8}
    />
  );
};
