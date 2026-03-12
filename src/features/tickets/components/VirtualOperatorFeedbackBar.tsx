import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { useGiveTicketReplyFeedback } from '../../../core/queries/ticketHooks';

interface VirtualOperatorFeedbackBarProps {
  ticketId: number;
  replyId: number;
  onFeedbackSent: (positive: boolean) => void;
}

export const VirtualOperatorFeedbackBar = ({
  ticketId,
  replyId,
  onFeedbackSent,
}: VirtualOperatorFeedbackBarProps) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { colors, palettes } = useTheme();
  const { mutateAsync: giveFeedback, isPending } = useGiveTicketReplyFeedback(
    ticketId,
    replyId,
  );

  const handleFeedback = (positive: boolean) => {
    giveFeedback(positive).then(
      () => onFeedbackSent(positive),
      () => Alert.alert(t('common.error'), t('ticketScreen.sendError')),
    );
  };

  return (
    <View style={styles.container}>
      <Col gap={1}>
        <Text variant="title" style={styles.title}>
          {t('ticketScreen.feedbackTitle')}
        </Text>
        <Text variant="secondaryText" style={styles.description}>
          {t('ticketScreen.feedbackDescription')}
        </Text>
      </Col>
      <Row align="center" style={styles.buttonsRow}>
        <Text variant="title" style={styles.question}>
          {t('ticketScreen.feedbackQuestion')}
        </Text>
        <Row gap={3} style={styles.buttons}>
          <IconButton
            icon={faThumbsDown}
            onPress={() => handleFeedback(false)}
            disabled={isPending}
            color={palettes.danger[600]}
            size={20}
            noPadding
            style={styles.thumbsDownButton}
          />
          <IconButton
            icon={faThumbsUp}
            onPress={() => handleFeedback(true)}
            disabled={isPending}
            color={colors.white}
            size={20}
            noPadding
            style={styles.thumbsUpButton}
          />
        </Row>
      </Row>
    </View>
  );
};

const createStyles = ({ spacing, palettes }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: palettes.gray[100],
      paddingHorizontal: spacing[4],
      paddingTop: spacing[2],
      paddingBottom: spacing[4],
      gap: spacing[3],
    },
    title: {
      color: palettes.primary[700],
      fontSize: 14,
      fontWeight: '600',
    },
    description: {
      fontSize: 12,
      lineHeight: 18,
      color: palettes.gray[600],
    },
    question: {
      flex: 1,
      color: palettes.primary[700],
      fontSize: 14,
      fontWeight: '600',
    },
    buttonsRow: {
      gap: spacing[5],
    },
    buttons: {
      justifyContent: 'flex-end',
      gap: spacing[3],
    },
    thumbsDownButton: {
      backgroundColor: palettes.danger[50],
      borderWidth: 1,
      borderColor: palettes.danger[600],
      width: 77.5,
      height: 45,
      borderRadius: 12,
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    thumbsUpButton: {
      backgroundColor: palettes.primary[500],
      width: 77.5,
      height: 45,
      borderRadius: 12,
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
