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
import { Badge } from '@lib/ui/components/Badge';
import { Grid, auto } from '@lib/ui/components/Grid';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useQueryClient } from '@tanstack/react-query';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { TICKETS_QUERY_KEY } from '../../../core/queries/ticketHooks';
import { split } from '../../../utils/reducers';
import { ServiceCard } from '../components/ServiceCard';

export const ServicesScreen = () => {
  const { t } = useTranslation();
  const { favoriteServices: favoriteServiceIds, updatePreference } =
    usePreferencesContext();
  const styles = useStylesheet(createStyles);
  const isOffline = useOfflineDisabled();

  const queryClient = useQueryClient();

  const { peopleSearched } = usePreferencesContext();

  const services = useMemo(
    () => [
      {
        id: 'tickets',
        name: t('ticketsScreen.title'),
        icon: faComments,
        disabled:
          isOffline &&
          queryClient.getQueryData(TICKETS_QUERY_KEY) === undefined,
        linkTo: { screen: 'Tickets' },
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
        additionalContent: <Badge text="BETA" style={styles.betaBadge} />,
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
        id: 'contacts',
        name: t('contactsScreen.title'),
        icon: faIdCard,
        disabled: isOffline && peopleSearched?.length === 0,
        linkTo: { screen: 'Contacts' },
      },
      {
        id: 'bookings',
        name: t('bookingsScreen.title'),
        icon: faPersonCirclePlus,
        linkTo: { screen: 'Bookings' },
      },
      {
        id: 'guides',
        name: t('guidesScreen.title'),
        icon: faSignsPost,
        disabled: true,
      },
      {
        id: 'library',
        name: t('libraryScreen.title'),
        icon: faBookBookmark,
        disabled: true,
      },
    ],
    [isOffline, queryClient, styles.betaBadge, t],
  );

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
              >
                {service.additionalContent}
              </ServiceCard>
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
              >
                {service.additionalContent}
              </ServiceCard>
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
    betaBadge: {
      position: 'absolute',
      top: -spacing[2.5],
      right: -spacing[2],
    },
  });
