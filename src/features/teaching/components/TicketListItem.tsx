import { faComments } from '@fortawesome/free-regular-svg-icons';
import { faChevronRight, faLink } from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { TicketOverview } from '@polito/api-client';

import { IS_IOS } from '../../../utils/const';
import { formatDateTime } from '../../../utils/dates';

interface Props {
  ticket: TicketOverview;
}

export const TicketListItem = ({ ticket }: Props) => {
  const { fontSizes, colors, spacing } = useTheme();
  console.debug({ ticket });

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

  return (
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
          {IS_IOS && (
            <Icon
              icon={faChevronRight}
              color={colors.secondaryText}
              style={{
                marginRight: -spacing[1],
              }}
            />
          )}
        </Row>
      }
    />
  );
};
