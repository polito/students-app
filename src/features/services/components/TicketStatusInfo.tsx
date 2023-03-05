import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { TicketOverview, TicketStatus } from '@polito/api-client';

import { formatDate, formatDateTime } from '../../../utils/dates';

interface TicketStatusProps {
  ticket: TicketOverview;
  loading?: boolean;
  refetching?: boolean;
}

export const TicketStatusInfo = ({
  ticket,
  loading,
  refetching,
}: TicketStatusProps) => {
  const { fontSizes, spacing } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const isClosed = ticket?.status === TicketStatus.Closed;

  console.debug({ ticket });

  if (loading) {
    return (
      <Col style={[styles.container, { paddingVertical: spacing[4] }]}>
        <ActivityIndicator />
      </Col>
    );
  }

  if (!loading && !ticket?.id) {
    return (
      <Col style={[styles.container]}>
        <Text style={[styles.text, styles.closed]}>
          {t('ticketScreen.error')}
        </Text>
      </Col>
    );
  }

  return (
    <Col style={styles.container}>
      <Row style={styles.row}>
        <Text style={styles.text}>{t('ticketScreen.ticket')}</Text>
        <Text style={styles.text}>#{ticket?.id}</Text>
      </Row>
      <Row style={styles.row}>
        <Text style={styles.text}>{t('ticketScreen.createdAt')}</Text>
        <Text style={styles.text}>
          {formatDate(ticket?.createdAt ?? new Date())}
        </Text>
      </Row>
      <Row style={styles.row}>
        <Text style={styles.text}>{t('ticketScreen.updatedAt')}</Text>
        <Text style={styles.text}>
          {formatDateTime(ticket?.updatedAt ?? new Date())}
        </Text>
      </Row>
      {refetching ? (
        <ActivityIndicator />
      ) : (
        <>
          <Row style={[styles.row]}>
            <Text style={[styles.text, isClosed && styles.closed]}>
              {t('ticketScreen.status')}
            </Text>
            <Text
              style={[
                styles.text,
                isClosed && styles.closed,
                { textTransform: 'uppercase' },
              ]}
            >
              {t(`ticketScreen.infoStatus-${ticket?.status}`)}
            </Text>
          </Row>
          {isClosed && (
            <Row style={[styles.row]}>
              <Text
                style={[styles.text, styles.closed, { fontSize: fontSizes.xs }]}
              >
                {t('ticketScreen.youCanReopenTheTicket')}
              </Text>
            </Row>
          )}
        </>
      )}
    </Col>
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
    text: {
      fontSize: fontSizes.sm,
    },
    closed: {
      color: colors.error[500],
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
    },
    row: {
      marginBottom: spacing['0.5'],
    },
    container: {
      marginVertical: spacing[3],
      marginHorizontal: spacing[4],
      backgroundColor: colors.surface,
      padding: spacing[2],
      paddingHorizontal: spacing[5],
      borderRadius: shapes.md,
    },
  });
