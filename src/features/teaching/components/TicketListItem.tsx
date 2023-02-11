import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import {
  faChevronRight,
  faEllipsisVertical,
  faLink,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { TicketOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { IS_IOS } from '../../../core/constants';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useMarkTicketAsClosed } from '../../../core/queries/ticketHooks';
import { formatDateTime } from '../../../utils/dates';

interface Props {
  ticket: TicketOverview;
}

export const TicketListItem = ({ ticket }: Props) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const { mutateAsync: markTicketAsClosed } = useMarkTicketAsClosed(ticket?.id);
  const confirm = useConfirmationDialog({
    message: t('tickets.closeTip'),
  });
  const { fontSizes, colors, spacing } = theme;
  const markTicketAsClosedEnabled = ticket?.status !== 'closed';

  const actions = useMemo(() => {
    if (!markTicketAsClosedEnabled) {
      return [];
    }
    return [
      {
        title: t('tickets.close'),
        color: 'red',
        image: 'trash.fill',
        imageColor: 'red',
      },
    ];
  }, [markTicketAsClosedEnabled]);

  const UnReadCount = () => {
    return (
      <Col justifyCenter alignCenter noFlex style={styles.unreadCount}>
        <Text style={styles.unreadCountText}>{ticket?.unreadCount || 0}</Text>
      </Col>
    );
  };

  const onPressCloseTicket = async () => {
    if (await confirm()) {
      return markTicketAsClosed();
    }
    return Promise.reject();
  };

  return (
    <MenuView
      title={t('tickets.menuAction')}
      actions={actions}
      onPressAction={onPressCloseTicket}
      shouldOpenOnLongPress={IS_IOS}
    >
      <ListItem
        linkTo={{
          screen: 'Ticket',
          params: { id: ticket.id },
        }}
        title={ticket.subject}
        subtitle={`${formatDateTime(ticket.updatedAt)} - ${ticket.message}`}
        subtitleStyle={styles.listItemSubtitle}
        leadingItem={<Icon icon={faComments} size={20} />}
        trailingItem={
          <Row noFlex alignCenter>
            <Icon
              icon={faLink}
              size={20}
              color={colors.text['400']}
              style={[
                ticket.unreadCount === 0 && { marginHorizontal: spacing['2'] },
              ]}
            />
            {ticket.unreadCount > 0 && <UnReadCount />}
            {IS_IOS && (
              <Icon
                icon={faChevronRight}
                color={colors.secondaryText}
                style={styles.icon}
              />
            )}
            {!IS_IOS && markTicketAsClosedEnabled && (
              <MenuView
                title={t('tickets.menuAction')}
                actions={actions}
                onPressAction={onPressCloseTicket}
              >
                <IconButton
                  style={styles.icon}
                  icon={faEllipsisVertical}
                  color={colors.secondaryText}
                  size={fontSizes.xl}
                />
              </MenuView>
            )}
          </Row>
        }
      />
    </MenuView>
  );
};

const createStyles = ({ spacing, fontSizes, colors }: Theme) =>
  StyleSheet.create({
    unreadCount: {
      height: 22,
      width: 22,
      marginHorizontal: spacing['2'],
      borderRadius: 22 / 2,
      backgroundColor: colors.error['500'],
    },
    unreadCountText: { color: 'white' },
    listItemSubtitle: {
      fontSize: fontSizes.xs,
    },
    icon: {
      marginRight: -spacing[1],
    },
  });
