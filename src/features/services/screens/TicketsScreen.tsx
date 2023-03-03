import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { TicketStatus } from '@polito/api-client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { useGetTickets } from '../../../core/queries/ticketHooks';
import { ServiceStackParamList } from '../components/ServiceNavigator';
import { TicketListItem } from '../components/TicketListItem';

interface Props {
  navigation: NativeStackNavigationProp<ServiceStackParamList, 'Tickets'>;
}

export const TicketsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const ticketsQuery = useGetTickets();
  const refreshControl = useRefreshControl(ticketsQuery);

  console.debug(ticketsQuery?.data?.data);

  const TicketsOpened = () => {
    const openTickets = (ticketsQuery?.data?.data || [])
      .filter(ticket => ticket.status !== TicketStatus.Closed)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
      <>
        <SectionHeader
          title={t('ticketsScreen.opened')}
          linkTo={
            openTickets?.length > 0
              ? {
                  screen: 'TicketList',
                  params: {
                    statuses: [TicketStatus.Pending, TicketStatus.New],
                  },
                }
              : undefined
          }
        />
        {!ticketsQuery.isLoading &&
          (openTickets.length > 0 ? (
            <Section>
              <SectionList>
                {openTickets?.slice(0, 3)?.map(ticket => (
                  <TicketListItem ticket={ticket} key={ticket.id} />
                ))}
              </SectionList>
            </Section>
          ) : (
            <SectionList>
              <EmptyState message={t('ticketsScreen.openEmptyState')} />
            </SectionList>
          ))}
      </>
    );
  };

  const TicketsClosed = () => {
    const closedTickets = (ticketsQuery?.data?.data || [])
      .filter(ticket => ticket.status === TicketStatus.Closed)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
      <View style={{ paddingTop: spacing[5] }}>
        <SectionHeader
          title={t('ticketsScreen.closed')}
          linkTo={
            closedTickets?.length > 0
              ? {
                  screen: 'TicketList',
                  params: { statuses: [TicketStatus.Closed] },
                }
              : undefined
          }
        />
        {!ticketsQuery.isLoading &&
          (closedTickets.length > 0 ? (
            <Section>
              <SectionList>
                {closedTickets?.slice(0, 3)?.map(ticket => (
                  <TicketListItem ticket={ticket} key={ticket.id} />
                ))}
              </SectionList>
            </Section>
          ) : (
            <SectionList>
              <EmptyState
                message={t('ticketsScreen.closedEmptyState')}
                icon={faComments}
              />
            </SectionList>
          ))}
      </View>
    );
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[bottomBarAwareStyles, scrollViewStyles]}
        refreshControl={<RefreshControl {...refreshControl} />}
      >
        <View style={{ paddingVertical: spacing[5] }}>
          <TicketsOpened />
          <TicketsClosed />
        </View>
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
