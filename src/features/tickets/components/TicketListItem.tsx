import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import {
  faChevronRight,
  faEllipsisVertical,
  faPaperclip,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { TicketOverview, TicketStatus } from '@polito/api-client';
import { useQueryClient } from '@tanstack/react-query';

import { IS_IOS } from '../../../core/constants';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  TICKET_QUERY_PREFIX,
  useMarkTicketAsClosed,
} from '../../../core/queries/ticketHooks';
import { formatDateTime } from '../../../utils/dates';
import { getHtmlTextContent } from '../../../utils/html';

interface TicketListItemProps extends Partial<ListItemProps> {
  ticket: TicketOverview;
}

export const TicketListItem = ({ ticket, ...props }: TicketListItemProps) => {
  const { fontSizes, colors, palettes, spacing, dark } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { mutateAsync: markTicketAsClosed } = useMarkTicketAsClosed(ticket?.id);
  const confirm = useConfirmationDialog({
    message: t('tickets.closeTip'),
  });

  const markTicketAsClosedEnabled = ticket?.status !== TicketStatus.Closed;
  const queryClient = useQueryClient();

  const isDataMissing = useCallback(
    () =>
      queryClient.getQueryData([TICKET_QUERY_PREFIX, ticket.id]) === undefined,
    [ticket, queryClient],
  );
  const isDisabled = useOfflineDisabled(isDataMissing);

  const actions = useMemo(() => {
    if (markTicketAsClosedEnabled) {
      return [
        {
          title: t('tickets.close'),
          titleColor: dark ? colors.white : colors.black,
          iconColor: 'red',
          systemIcon: 'trash.fill',
        },
      ];
    }
    return [];
  }, [markTicketAsClosedEnabled, t, dark, colors]);

  const UnReadCount = useCallback(
    () => (
      <Col justify="center" align="center" style={styles.unreadCount}>
        <Text style={styles.unreadCountText}>{ticket?.unreadCount || 0}</Text>
      </Col>
    ),
    [styles, ticket],
  );

  const onPressCloseTicket = useCallback(async () => {
    if (await confirm()) {
      return markTicketAsClosed();
    }
    return Promise.reject();
  }, [confirm, markTicketAsClosed]);

  const Item = useCallback(
    () => (
      <ListItem
        {...props}
        accessibilityRole="button"
        accessible={true}
        linkTo={{
          screen: 'Ticket',
          params: { id: ticket.id },
        }}
        disabled={isDisabled}
        title={getHtmlTextContent(ticket?.subject)}
        subtitle={`${formatDateTime(ticket.updatedAt)} - ${getHtmlTextContent(
          ticket?.message,
        )}`}
        subtitleStyle={styles.listItemSubtitle}
        leadingItem={<Icon icon={faComments} size={20} />}
        trailingItem={
          <Row align="center">
            {ticket?.hasAttachments && (
              <Icon
                icon={faPaperclip}
                size={20}
                color={palettes.text[400]}
                style={
                  ticket.unreadCount === 0 && {
                    marginHorizontal: spacing[2],
                  }
                }
              />
            )}
            {ticket.unreadCount > 0 && <UnReadCount />}
            {IS_IOS && (
              <Icon
                icon={faChevronRight}
                color={colors.secondaryText}
                style={styles.icon}
              />
            )}
            {!IS_IOS && markTicketAsClosedEnabled && (
              <ContextMenu
                title={t('tickets.menuAction')}
                actions={actions}
                onPress={onPressCloseTicket}
                dropdownMenuMode
              >
                <IconButton
                  style={styles.icon}
                  icon={faEllipsisVertical}
                  color={colors.secondaryText}
                  size={fontSizes.xl}
                />
              </ContextMenu>
            )}
          </Row>
        }
      />
    ),
    [
      props,
      ticket,
      isDisabled,
      styles,
      palettes,
      spacing,
      colors,
      fontSizes,
      UnReadCount,
      markTicketAsClosedEnabled,
      actions,
      onPressCloseTicket,
      t,
    ],
  );

  if (IS_IOS) {
    return (
      <ContextMenu
        title={t('tickets.menuAction')}
        actions={actions}
        onPress={actions.length > 0 ? onPressCloseTicket : undefined}
      >
        <Item />
      </ContextMenu>
    );
  }

  return <Item />;
};

const createStyles = ({ spacing, fontSizes, palettes }: Theme) =>
  StyleSheet.create({
    unreadCount: {
      height: 22,
      width: 22,
      marginHorizontal: spacing[2],
      borderRadius: 22 / 2,
      backgroundColor: palettes.error[500],
    },
    // Theme-independent hardcoded color
    // eslint-disable-next-line react-native/no-color-literals
    unreadCountText: { color: 'white' },
    listItemSubtitle: {
      fontSize: fontSizes.xs,
    },
    icon: {
      marginRight: -spacing[1],
    },
  });
