import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { TicketStatus } from '@polito/api-client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetTickets } from '../../../core/queries/ticketHooks';
import { ServiceStackParamList } from '../components/ServicesNavigator';
import { TicketListItem } from '../components/TicketListItem';

interface Props {
  navigation: NativeStackNavigationProp<ServiceStackParamList, 'Tickets'>;
}

export const TicketsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const ticketsQuery = useGetTickets();
  const refreshControl = useRefreshControl(ticketsQuery);

  const OpenTickets = () => {
    const openTickets = (ticketsQuery?.data?.data || [])
      .filter(ticket => ticket.status !== TicketStatus.Closed)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
      <Section>
        <SectionHeader title={t('ticketsScreen.opened')} />
        {!ticketsQuery.isLoading &&
          (openTickets.length > 0 ? (
            <SectionList>
              {openTickets?.map(ticket => (
                <TicketListItem ticket={ticket} key={ticket.id} />
              ))}
            </SectionList>
          ) : (
            <SectionList>
              <EmptyState message={t('ticketsScreen.openEmptyState')} />
            </SectionList>
          ))}
      </Section>
    );
  };

  const ClosedTickets = () => {
    const closedTickets = useMemo(() => {
      return (ticketsQuery?.data?.data || [])
        .filter(ticket => ticket.status === TicketStatus.Closed)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }, [ticketsQuery]);

    const renderedClosedTickets = useMemo(
      () => closedTickets.slice(0, 4),
      [closedTickets],
    );

    return (
      <Section>
        <SectionHeader
          title={t('ticketsScreen.closed')}
          linkTo={{
            screen: 'TicketList',
            params: { statuses: [TicketStatus.Closed] },
          }}
          linkToMoreCount={closedTickets.length - renderedClosedTickets.length}
        />
        {!ticketsQuery.isLoading &&
          (renderedClosedTickets.length > 0 ? (
            <SectionList>
              {renderedClosedTickets.map(ticket => (
                <TicketListItem ticket={ticket} key={ticket.id} />
              ))}
            </SectionList>
          ) : (
            <SectionList>
              <EmptyState
                message={t('ticketsScreen.closedEmptyState')}
                icon={faComments}
              />
            </SectionList>
          ))}
      </Section>
    );
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl {...refreshControl} />}
        contentContainerStyle={styles.container}
      >
        <OpenTickets />
        <ClosedTickets />
      </ScrollView>
      <CtaButton
        absolute={true}
        title={t('ticketsScreen.addNew')}
        action={() => navigation.navigate('TicketFaqs')}
        icon={faPlus}
      />
    </>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
  });
