import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  faBookBookmark,
  faBriefcase,
  faBullhorn,
  faComments,
  faIdCard,
  faMobileScreenButton,
  faPersonCirclePlus,
  faSignsPost,
} from '@fortawesome/free-solid-svg-icons';
import { Grid, auto } from '@lib/ui/components/Grid';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useQueryClient } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { usePushNotifications } from '../../../core/hooks/usePushNotifications';
import { BOOKINGS_QUERY_KEY } from '../../../core/queries/bookingHooks';
import { TICKETS_QUERY_KEY } from '../../../core/queries/ticketHooks';
import { split } from '../../../utils/reducers';
import { ServiceCard } from '../components/ServiceCard';

export const ServicesScreen = () => {
  const { t } = useTranslation();
  const {
    favoriteServices: favoriteServiceIds,
    emailGuideRead,
    updatePreference,
  } = usePreferencesContext();
  const { getUnreadsCount } = usePushNotifications();
  const styles = useStylesheet(createStyles);
  const isOffline = useOfflineDisabled();
  const queryClient = useQueryClient();
  const { peopleSearched } = usePreferencesContext();
  const unreadTickets = getUnreadsCount(['services', 'tickets']);
  const services = useMemo(() => {
    return [
      {
        id: 'tickets',
        name: t('ticketsScreen.title'),
        icon: faComments,
        disabled:
          isOffline &&
          queryClient.getQueryData(TICKETS_QUERY_KEY) === undefined,
        linkTo: { screen: 'Tickets' },
        additionalContent: unreadTickets && (
          <UnreadBadge text={unreadTickets} style={styles.badge} />
        ),
      },
      {
        id: 'appFeedback',
        name: t('common.appFeedback'),
        icon: faMobileScreenButton,
        disabled: isOffline,
        linkTo: {
          screen: 'CreateTicket',
          params: {
            topicId: 1101,
            subtopicId: 2001,
          },
        },
        additionalContent: <UnreadBadge text="BETA" style={styles.badge} />,
      },
      {
        id: 'github',
        name: t('common.openSource'),
        icon: faGithub,
        onPress: () =>
          Linking.openURL('https://github.com/polito/students-app'),
      },
      {
        id: 'news',
        name: t('newsScreen.title'),
        icon: faBullhorn,
        disabled: isOffline,
        linkTo: {
          screen: 'News',
        },
      },
      {
        id: 'jobOffers',
        name: t('jobOffersScreen.title'),
        icon: faBriefcase,
        disabled: isOffline,
        linkTo: { screen: 'JobOffers' },
      },
      {
        id: 'offering',
        name: t('offeringScreen.title'),
        icon: faBookBookmark,
        disabled: isOffline,
        linkTo: { screen: 'Offering' },
      },
      {
        id: 'contacts',
        name: t('contactsScreen.title'),
        icon: faIdCard,
        disabled: isOffline && peopleSearched?.length === 0, // TODO why?
        linkTo: { screen: 'Contacts' },
      },
      {
        id: 'guides',
        name: t('guidesScreen.title'),
        icon: faSignsPost,
        linkTo: { screen: 'Guides' },
        unReadCount: emailGuideRead ? 0 : 1,
      },
      {
        id: 'bookings',
        name: t('bookingsScreen.title'),
        icon: faPersonCirclePlus,
        disabled:
          isOffline &&
          queryClient.getQueryData(BOOKINGS_QUERY_KEY) === undefined,
        linkTo: { screen: 'Bookings' },
      },
      {
        id: 'surveys',
        name: t('surveysScreen.title'),
        icon: faComments,
        disabled: isOffline,
        linkTo: { screen: 'Surveys' },
      },
    ];
  }, [
    emailGuideRead,
    isOffline,
    peopleSearched?.length,
    queryClient,
    styles.badge,
    t,
    unreadTickets,
  ]);

  const [favoriteServices, otherServices] = useMemo(
    () =>
      services.reduce(
        split(s => favoriteServiceIds.includes(s.id)),
        [[], []],
      ),
    [favoriteServiceIds, services],
  );

  const updateFavorite =
    (service: typeof services[number]) => (favorite: boolean) => {
      const newVal = favorite
        ? [...new Set([...favoriteServiceIds, service.id])]
        : favoriteServiceIds.filter(fs => fs !== service.id);
      updatePreference('favoriteServices', newVal);
    };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        {favoriteServices.length > 0 && (
          <Grid
            numColumns={auto}
            minColumnWidth={ServiceCard.minWidth}
            maxColumnWidth={ServiceCard.maxWidth}
            gap={4}
            style={styles.grid}
          >
            {favoriteServices.map(service => (
              <ServiceCard
                key={service.id}
                name={service.name}
                icon={service.icon}
                disabled={service.disabled}
                linkTo={service.linkTo}
                onPress={service.onPress}
                favorite
                onFavoriteChange={updateFavorite(service)}
                unReadCount={service?.unReadCount}
              />
            ))}
          </Grid>
        )}

        {otherServices.length > 0 && (
          <Grid
            numColumns={auto}
            minColumnWidth={ServiceCard.minWidth}
            maxColumnWidth={ServiceCard.maxWidth}
            gap={4}
            style={styles.grid}
          >
            {otherServices.map(service => (
              <ServiceCard
                key={service.id}
                name={service.name}
                icon={service.icon}
                disabled={service.disabled}
                linkTo={service.linkTo}
                onPress={service.onPress}
                onFavoriteChange={updateFavorite(service)}
                unReadCount={service?.unReadCount}
              />
            ))}
          </Grid>
        )}
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    grid: {
      margin: spacing[5],
    },
    badge: {
      position: 'absolute',
      top: -spacing[2.5],
      right: -spacing[2],
    },
  });
