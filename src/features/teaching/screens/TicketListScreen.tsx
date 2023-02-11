import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { TicketStatus } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetTickets } from '../../../core/queries/ticketHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { TicketListItem } from '../components/TicketListItem';

type Props = NativeStackScreenProps<TeachingStackParamList, 'TicketList'>;

export const TicketListScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { statuses } = route.params;
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const ticketsQuery = useGetTickets();
  const refreshControl = useRefreshControl(ticketsQuery);

  const tickets = (ticketsQuery?.data?.data || [])
    .filter(ticket => statuses.includes(ticket.status))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const labels = useMemo(() => {
    const closedTicket = statuses.indexOf(TicketStatus.Closed) > -1;
    return {
      title: closedTicket
        ? t('ticketsScreen.closed')
        : t('ticketsScreen.opened'),
      emptyState: closedTicket
        ? t('ticketsScreen.closedEmptyState')
        : t('ticketsScreen.openEmptyState'),
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: labels.title,
    });
  }, [labels.title]);

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[bottomBarAwareStyles]}
        refreshControl={<RefreshControl {...refreshControl} />}
      >
        <Section>
          {!ticketsQuery.isLoading &&
            (tickets.length > 0 ? (
              <SectionList>
                {tickets?.map(ticket => (
                  <TicketListItem ticket={ticket} key={ticket.id} />
                ))}
              </SectionList>
            ) : (
              <EmptyState message={labels.emptyState} icon={faComments} />
            ))}
        </Section>
      </ScrollView>
    </>
  );
};
