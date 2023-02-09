import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';

import { orderBy, slice } from 'lodash';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { useGetTickets } from '../../../core/queries/ticketHooks';
import { TicketListItem } from '../components/TicketListItem';

export const TicketsScreen = () => {
  const { t } = useTranslation();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const ticketsQuery = useGetTickets();
  const refreshControl = useRefreshControl(ticketsQuery);

  const TicketsOpened = () => {
    const openTickets = ticketsQuery?.data?.data.filter(
      ticket => ticket.status !== 'closed',
    );
    return (
      <Section>
        <SectionHeader title={t('ticketsScreen.opened')} />
        {!ticketsQuery.isLoading &&
          (openTickets.length > 0 ? (
            <Section>
              <SectionList>
                {orderBy(slice(openTickets, 0, 3), ['updatedAt']).map(
                  ticket => (
                    <TicketListItem ticket={ticket} key={ticket.id} />
                  ),
                )}
              </SectionList>
            </Section>
          ) : (
            <EmptyState
              message={t('ticketsScreen.openEmptyState')}
              icon={faComments}
            />
          ))}
      </Section>
    );
  };

  const TicketsClosed = () => {
    const closedTickets = (ticketsQuery?.data?.data || []).filter(ticket =>
      ['closed'].includes(ticket.status),
    );
    return (
      <Section>
        <SectionHeader
          title={t('ticketsScreen.opened')}
          linkTo={
            closedTickets?.length > 3
              ? { screen: 'TicketList', params: { status: 'closed' } }
              : undefined
          }
        />
        {!ticketsQuery.isLoading &&
          (closedTickets.length > 0 ? (
            <Section>
              <SectionList>
                {orderBy(slice(closedTickets, 0, 3), ['updatedAt']).map(
                  ticket => (
                    <TicketListItem ticket={ticket} key={ticket.id} />
                  ),
                )}
              </SectionList>
            </Section>
          ) : (
            <EmptyState
              message={t('ticketsScreen.openEmptyState')}
              icon={faComments}
            />
          ))}
      </Section>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[bottomBarAwareStyles, scrollViewStyles]}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <TicketsOpened />
      <TicketsClosed />
    </ScrollView>
  );
};
