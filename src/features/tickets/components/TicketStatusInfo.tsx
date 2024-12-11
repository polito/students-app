import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Metric } from '@lib/ui/components/Metric';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { TicketOverview, TicketStatus } from '@polito/api-client';

import { GlobalStyles } from '../../../core/styles/GlobalStyles';
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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const isClosed = ticket.status === TicketStatus.Closed;

  const accessibilityIdText = [t('ticketScreen.ticketNumber'), ticket?.id].join(
    ', ',
  );
  const accessibilityCreatedAtText = [
    t('common.createdAt'),
    formatDate(ticket.createdAt),
  ].join(', ');
  const accessibilityStatusText = [
    t('common.status'),
    t(`tickets.status.${ticket.status}`),
  ].join(', ');
  const accessibilityUpdatedAtText = [
    t('common.updatedAt'),
    formatDateTime(ticket.updatedAt),
  ].join(', ');

  if (loading) {
    return (
      <Col>
        <ActivityIndicator />
      </Col>
    );
  }

  return (
    <Card style={styles.card}>
      <Text variant="title" style={styles.row}>
        {ticket.subject}
      </Text>
      <Row style={styles.row}>
        <Pressable
          accessibilityLabel={accessibilityIdText}
          accessibilityRole="text"
          style={GlobalStyles.grow}
        >
          <Metric
            accessibilityLabel={accessibilityIdText}
            accessibilityRole="text"
            title={t('ticketScreen.ticketNumber')}
            value={ticket.id}
          />
        </Pressable>
        <Pressable
          accessibilityLabel={accessibilityCreatedAtText}
          accessibilityRole="text"
          style={GlobalStyles.grow}
        >
          <Metric
            accessibilityLabel={accessibilityCreatedAtText}
            accessibilityRole="text"
            title={t('common.createdAt')}
            value={formatDate(ticket.createdAt)}
          />
        </Pressable>
      </Row>
      <Row style={styles.row}>
        <Pressable
          accessibilityLabel={accessibilityUpdatedAtText}
          accessibilityRole="text"
          style={GlobalStyles.grow}
        >
          <Metric
            accessibilityLabel={accessibilityUpdatedAtText}
            accessibilityRole="text"
            title={t('common.updatedAt')}
            value={formatDateTime(ticket.updatedAt)}
          />
        </Pressable>
        <Pressable
          accessibilityLabel={accessibilityStatusText}
          accessibilityRole="text"
          style={GlobalStyles.grow}
        >
          <Metric
            accessibilityLabel={accessibilityStatusText}
            accessibilityRole="text"
            title={t('common.status')}
            value={t(`tickets.status.${ticket.status}`)}
            valueStyle={{ textTransform: 'uppercase' }}
          />
        </Pressable>
        {/* TODO colors? */}
      </Row>
      {refetching ? (
        <ActivityIndicator />
      ) : (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {isClosed && (
            <Row>
              <Icon
                icon={faInfoCircle}
                color={colors.secondaryText}
                style={styles.infoIcon}
              />
              <Text variant="secondaryText" style={GlobalStyles.grow}>
                {t('ticketScreen.youCanReopenTheTicket')}
              </Text>
            </Row>
          )}
        </>
      )}
    </Card>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    infoIcon: {
      marginTop: spacing[0.5],
      marginRight: spacing[2],
    },
    card: {
      marginHorizontal: Platform.select({ ios: spacing[3] }),
      marginVertical: Platform.select({ ios: spacing[3] }),
      padding: spacing[4],
    },
    row: {
      marginBottom: spacing[4],
    },
  });
