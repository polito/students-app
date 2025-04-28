import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  faBookBookmark,
  faBriefcase,
  faClipboardQuestion,
  faComments,
  faEnvelope,
  faIdCard,
  faMobileScreenButton,
  faNewspaper,
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
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { BOOKINGS_QUERY_KEY } from '../../../core/queries/bookingHooks';
import { TICKETS_QUERY_KEY } from '../../../core/queries/ticketHooks';
import {
  GetWebmailLink,
  WEBMAIL_LINK_QUERY_KEY,
  useGetUnreadEmails,
} from '../../../core/queries/webMailHooks';
import { split } from '../../../utils/reducers';
import { ServiceCard } from '../components/ServiceCard';

export const ServicesScreen = () => {
  const { t } = useTranslation();
  const {
    favoriteServices: favoriteServiceIds,
    emailGuideRead,
    updatePreference,
  } = usePreferencesContext();
  const { getUnreadsCount } = useNotifications();
  const styles = useStylesheet(createStyles);
  const isOffline = useOfflineDisabled();
  const queryClient = useQueryClient();
  const { peopleSearched } = usePreferencesContext();
  const unreadTickets = getUnreadsCount(['services', 'tickets']);
  const unreadEmailsQuery = useGetUnreadEmails();

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
        unReadCount: unreadTickets,
        accessibilityLabel: `${t('ticketsScreen.title')} ${
          unreadTickets ? t('servicesScreen.newElement') : ''
        }`,
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
        accessibilityLabel: t('common.appFeedback'),
      },
      {
        id: 'github',
        name: t('common.openSource'),
        icon: faGithub,
        onPress: () =>
          Linking.openURL('https://github.com/polito/students-app'),
        accessibilityLabel: t('common.openSourceAccessibilityLabel'),
      },
      {
        id: 'news',
        name: t('newsScreen.title'),
        icon: faNewspaper,
        disabled: isOffline,
        linkTo: {
          screen: 'News',
        },
        unReadCount: getUnreadsCount(['services', 'news']),
        accessibilityLabel: `${t('newsScreen.title')} ${
          getUnreadsCount(['services', 'news'])
            ? t('servicesScreen.newElement')
            : ''
        }`,
      },
      {
        id: 'jobOffers',
        name: t('jobOffersScreen.title'),
        icon: faBriefcase,
        disabled: isOffline,
        linkTo: { screen: 'JobOffers' },
        accessibilityLabel: t('jobOffersScreen.title'),
      },
      {
        id: 'offering',
        name: t('offeringScreen.title'),
        icon: faBookBookmark,
        disabled: isOffline,
        linkTo: { screen: 'Offering' },
        accessibilityLabel: t('offeringScreen.title'),
      },
      {
        id: 'contacts',
        name: t('contactsScreen.title'),
        icon: faIdCard,
        disabled: isOffline && peopleSearched?.length === 0, // TODO why?
        linkTo: { screen: 'Contacts' },
        accessibilityLabel: t('contactsScreen.title'),
      },
      {
        id: 'guides',
        name: t('guidesScreen.title'),
        icon: faSignsPost,
        linkTo: { screen: 'Guides' },
        unReadCount: emailGuideRead ? 0 : 1,
        accessibilityLabel: `${t('guidesScreen.title')} ${
          !emailGuideRead ? t('servicesScreen.newElement') : ''
        }`,
      },
      {
        id: 'bookings',
        name: t('bookingsScreen.title'),
        icon: faPersonCirclePlus,
        disabled:
          isOffline &&
          queryClient.getQueryData(BOOKINGS_QUERY_KEY) === undefined,
        linkTo: { screen: 'Bookings' },
        accessibilityLabel: t('bookingsScreen.title'),
      },
      {
        id: 'surveys',
        name: t('surveysScreen.title'),
        icon: faClipboardQuestion,
        disabled: isOffline,
        linkTo: { screen: 'Surveys' },
        accessibilityLabel: t('surveysScreen.title'),
      },
      {
        id: 'mail',
        name: 'WebMail',
        icon: faEnvelope,
        disabled: isOffline,
        unReadCount: unreadEmailsQuery.data
          ? unreadEmailsQuery.data.unreadEmails
          : 0,
        onPress: () => {
          queryClient
            .fetchQuery(WEBMAIL_LINK_QUERY_KEY, GetWebmailLink, {
              staleTime: 55 * 1000, // 55 seconds
              cacheTime: 55 * 1000, // 55 seconds
            })
            .then(res => Linking.openURL(res.url ?? ''));
        },
        accessibilityLabel: `${t('WebMail')} ${
          unreadEmailsQuery.data ? t('servicesScreen.newElement') : ''
        }`,
      },
    ];
  }, [
    emailGuideRead,
    getUnreadsCount,
    isOffline,
    peopleSearched?.length,
    queryClient,
    styles.badge,
    t,
    unreadTickets,
    unreadEmailsQuery.data,
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
    (service: (typeof services)[number]) => (favorite: boolean) => {
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
                accessibilityLabel={service?.accessibilityLabel}
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
                accessibilityLabel={service?.accessibilityLabel}
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
