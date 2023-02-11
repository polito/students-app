import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { IS_IOS } from '../../../core/constants';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { useGetTickets } from '../../../core/queries/ticketHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';
import { TicketListItem } from '../components/TicketListItem';

interface Props {
  navigation: NativeStackNavigationProp<TeachingStackParamList, 'Tickets'>;
}

export const TicketsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const ticketsQuery = useGetTickets();
  const refreshControl = useRefreshControl(ticketsQuery);

  const handleOpenNewTicket = () => {
    navigation.navigate('TicketFaqs');
  };

  const TicketsOpened = () => {
    const openTickets = (ticketsQuery?.data?.data || [])
      .filter(ticket => ticket.status !== 'closed')
      .slice(0, 2)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
      <Section>
        <SectionHeader title={t('ticketsScreen.opened')} />
        {!ticketsQuery.isLoading &&
          (openTickets.length > 0 ? (
            <Section>
              <SectionList>
                {openTickets.map(ticket => (
                  <TicketListItem ticket={ticket} key={ticket.id} />
                ))}
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
    const closedTickets = (ticketsQuery?.data?.data || [])
      .filter(ticket => ticket.status === 'closed')
      .slice(0, 2)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
      <Section>
        <SectionHeader
          title={t('ticketsScreen.closed')}
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
                {closedTickets.map(ticket => (
                  <TicketListItem ticket={ticket} key={ticket.id} />
                ))}
              </SectionList>
            </Section>
          ) : (
            <EmptyState
              message={t('ticketsScreen.closedEmptyState')}
              icon={faComments}
            />
          ))}
      </Section>
    );
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[bottomBarAwareStyles, scrollViewStyles]}
        refreshControl={<RefreshControl {...refreshControl} />}
      >
        <TicketsOpened />
        <TicketsClosed />
      </ScrollView>
      <CtaButton
        absolute={true}
        adjustInsets={IS_IOS}
        title={t('ticketsScreen.addNew')}
        action={handleOpenNewTicket}
        icon={faPlus}
      />
    </>
  );
};
