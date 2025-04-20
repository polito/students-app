import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';

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
import { TicketOverview, TicketStatus } from '@polito/api-client';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onlineManager } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useGetTickets } from '../../../core/queries/ticketHooks';
import { getHtmlTextContent } from '../../../utils/html';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { TicketListItem } from '../components/TicketListItem';

interface Props {
  navigation: NativeStackNavigationProp<ServiceStackParamList, 'Tickets'>;
}

const ListItem = ({
  ticket,
  index,
  totalData,
}: {
  ticket: TicketOverview;
  index: number;
  totalData: number;
}) => {
  const { getUnreadsCount } = useNotifications();
  const unread = useMemo(
    () => !!getUnreadsCount(['services', 'tickets', ticket.id.toString()]),
    [getUnreadsCount, ticket.id],
  );

  const { accessibilityListLabel } = useAccessibility();
  const accessibilityLabel = [
    accessibilityListLabel(index, totalData),
    getHtmlTextContent(ticket?.subject),
  ].join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <TicketListItem
        accessibilityLabel={accessibilityLabel}
        ticket={ticket}
        key={ticket.id}
        unread={unread}
      />
    </Pressable>
  );
};

export const TicketsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const ticketsQuery = useGetTickets();

  const OpenTickets = () => {
    const openTickets = (ticketsQuery.data || [])
      .filter(ticket => ticket.status !== TicketStatus.Closed)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    useFocusEffect(
      useCallback(() => {
        if (!ticketsQuery?.data || openTickets?.length > 0) {
          return;
        }
        AccessibilityInfo.announceForAccessibility(
          t('ticketsScreen.noOpenTickets'),
        );
      }, [openTickets]),
    );

    const sectionHeaderTicketOpenAccessibilityLabel = useMemo(() => {
      const baseText = t('ticketsScreen.opened');
      if (openTickets?.length > 0) {
        return baseText;
      } else {
        return [baseText, t('ticketsScreen.noOpenTickets')].join(', ');
      }
    }, [openTickets]);

    return (
      <Section>
        <SectionHeader
          accessibilityLabel={sectionHeaderTicketOpenAccessibilityLabel}
          title={t('ticketsScreen.opened')}
        />
        {!ticketsQuery.isLoading &&
          (openTickets.length > 0 ? (
            <OverviewList indented>
              {openTickets?.map((ticket, index) => (
                <ListItem
                  totalData={openTickets?.length || 0}
                  index={index}
                  ticket={ticket}
                  key={ticket.id}
                />
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

    const sectionHeaderTicketClosedAccessibilityLabel = useMemo(() => {
      const baseText = t('ticketsScreen.closed');
      if (renderedClosedTickets.length > 0) {
        return baseText;
      } else {
        return [baseText, t('ticketsScreen.noClosedTickets')].join(', ');
      }
    }, [renderedClosedTickets]);

    return (
      <Section>
        <SectionHeader
          accessibilityLabel={sectionHeaderTicketClosedAccessibilityLabel}
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
              {renderedClosedTickets.map((ticket, index) => (
                <ListItem
                  totalData={renderedClosedTickets?.length || 0}
                  index={index}
                  ticket={ticket}
                  key={ticket.id}
                />
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
