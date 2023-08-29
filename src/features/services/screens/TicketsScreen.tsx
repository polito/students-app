import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { TicketStatus } from '@polito/api-client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onlineManager } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
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

  const OpenTickets = () => {
    const openTickets = (ticketsQuery.data || [])
      .filter(ticket => ticket.status !== TicketStatus.Closed)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
      <Section>
        <SectionHeader title={t('ticketsScreen.opened')} />
        {!ticketsQuery.isLoading &&
          (openTickets.length > 0 ? (
            <OverviewList indented>
              {openTickets?.map(ticket => (
                <TicketListItem ticket={ticket} key={ticket.id} />
              ))}
            </OverviewList>
          ) : (
            <OverviewList>
              <EmptyState message={t('ticketsScreen.openEmptyState')} />
            </OverviewList>
          ))}
      </Section>
    );
  };

  const ClosedTickets = () => {
    const closedTickets = (ticketsQuery.data || [])
      .filter(ticket => ticket.status === TicketStatus.Closed)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

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
            <OverviewList indented>
              {renderedClosedTickets.map(ticket => (
                <TicketListItem ticket={ticket} key={ticket.id} />
              ))}
            </OverviewList>
          ) : (
            <OverviewList>
              <EmptyState
                message={t('ticketsScreen.closedEmptyState')}
                icon={faComments}
              />
            </OverviewList>
          ))}
      </Section>
    );
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl queries={[ticketsQuery]} manual />}
        contentContainerStyle={styles.container}
      >
        <SafeAreaView>
          <OpenTickets />
          <ClosedTickets />
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>

      <CtaButton
        absolute={true}
        disabled={!onlineManager.isOnline()}
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
