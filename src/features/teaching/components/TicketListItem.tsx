import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

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
import { TicketOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { IS_IOS } from '../../../utils/const';
import { formatDateTime } from '../../../utils/dates';

interface Props {
  ticket: TicketOverview;
}

export const TicketListItem = ({ ticket }: Props) => {
  const { fontSizes, colors, spacing } = useTheme();
  const { t } = useTranslation();
  console.debug({ ticket });

  const actions = [
    {
      title: t('tickets.close'),
      color: 'red',
      image: 'trash.fill',
      imageColor: 'red',
    },
  ];

  const UnReadCount = () => {
    return (
      <Col
        justifyCenter
        alignCenter
        noFlex
        style={{
          height: 22,
          width: 22,
          marginHorizontal: spacing['2'],
          borderRadius: 22 / 2,
          backgroundColor: colors.error['500'],
        }}
      >
        <Text style={{ color: 'white' }}>{ticket?.unreadCount || 0}</Text>
      </Col>
    );
  };

  const onPressCloseTicket = () => {
    Alert.alert(t('tickets.close'), t('tickets.close'), [
      {
        text: 'Confirm',
        onPress: () => console.debug('Cancel Pressed'),
        style: 'cancel',
      },
    ]);
  };

  return (
    <MenuView
      title={t('tickets.menuAction')}
      actions={actions}
      onPressAction={onPressCloseTicket}
      shouldOpenOnLongPress={!IS_IOS}
    >
      <ListItem
        linkTo={{
          screen: 'Ticket',
          params: { id: ticket.id },
        }}
        title={ticket.subject}
        subtitle={`${formatDateTime(ticket.updatedAt)} - ${ticket.message}`}
        subtitleStyle={{
          fontSize: fontSizes.xs,
        }}
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
            {IS_IOS ? (
              <Icon
                icon={faChevronRight}
                color={colors.secondaryText}
                style={{
                  marginRight: -spacing[1],
                }}
              />
            ) : (
              <MenuView
                title={t('tickets.menuAction')}
                actions={actions}
                onPressAction={onPressCloseTicket}
              >
                <IconButton
                  style={{
                    marginRight: -spacing[1],
                  }}
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
