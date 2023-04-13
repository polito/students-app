import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform } from 'react-native';

import { EmptyState } from '@lib/ui/components/EmptyState';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { TicketStatus } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetTickets } from '../../../core/queries/ticketHooks';
import { ServiceStackParamList } from '../components/ServicesNavigator';
import { TicketListItem } from '../components/TicketListItem';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketList'>;

export const TicketListScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { statuses } = route.params;
  const ticketsQuery = useGetTickets();
  const refreshControl = useRefreshControl(ticketsQuery);

  const tickets = useMemo(
    () =>
      ticketsQuery.data
        ?.filter(ticket => statuses.includes(ticket.status))
        ?.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) ?? [],
    [ticketsQuery],
  );

  const labels = useMemo(() => {
    const closedTicket = statuses.includes(TicketStatus.Closed);
    return {
      title: closedTicket
        ? t('ticketsScreen.closed')
        : t('ticketsScreen.opened'),
      emptyState: closedTicket
        ? t('ticketsScreen.closedEmptyState')
        : t('ticketsScreen.openEmptyState'),
    };
  }, []);

  useScreenTitle(labels.title);

  if (!ticketsQuery.isLoading && !tickets.length) {
    return <EmptyState message={labels.emptyState} />;
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      {...refreshControl}
      data={tickets}
      renderItem={({ item }) => <TicketListItem ticket={item} key={item.id} />}
      ItemSeparatorComponent={Platform.select({
        ios: IndentedDivider,
      })}
    />
  );
};
