import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import {
  faComments,
  faIdCard,
  faMobileScreenButton,
} from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { Grid, auto } from '@lib/ui/components/Grid';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { split } from '../../../utils/reducers';
import { ServiceCard } from '../components/ServiceCard';

export const ServicesScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { favoriteServices: favoriteServiceIds, updatePreference } =
    usePreferencesContext();
  const styles = useStylesheet(createStyles);
  const services = [
    {
      id: 'contacts',
      name: t('contactsScreen.title'),
      icon: faIdCard,
      disabled: true,
    },
    {
      id: 'tickets',
      name: t('ticketScreen.title'),
      icon: faComments,
      linkTo: { screen: 'Tickets' },
    },
    {
      id: 'appFeedback',
      name: t('common.appFeedback'),
      icon: faMobileScreenButton,
      linkTo: {
        screen: 'CreateTicket',
        params: {
          topicId: 1101,
          subtopicId: 2001,
        },
      },
      additionalContent: <Badge text="BETA" style={styles.betaBadge} />,
    },
  ];

  const [favoriteServices, otherServices] = useMemo(
    () =>
      services.reduce(
        split(s => favoriteServiceIds.includes(s.id)),
        [[], []],
      ),
    [favoriteServiceIds],
  );

  const updateFavorite =
    (service: typeof services[number]) => (favorite: boolean) => {
      const newVal = favorite
        ? [...new Set([...favoriteServiceIds, service.id])]
        : favoriteServiceIds.filter(fs => fs !== service.id);
      updatePreference('favoriteServices', newVal);
    };

  return (
    <ScrollView contentInsetAdjustmentBehavior="always">
      {favoriteServices.length > 0 && (
        <Grid
          numColumns={auto}
          minColumnWidth={ServiceCard.minWidth}
          maxColumnWidth={ServiceCard.maxWidth}
          gap={+spacing[4]}
          style={styles.grid}
        >
          {favoriteServices.map(service => (
            <ServiceCard
              key={service.id}
              name={service.name}
              icon={service.icon}
              disabled={service.disabled}
              linkTo={service.linkTo}
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
          gap={+spacing[4]}
          style={styles.grid}
        >
          {otherServices.map(service => (
            <ServiceCard
              key={service.id}
              name={service.name}
              icon={service.icon}
              disabled={service.disabled}
              linkTo={service.linkTo}
              onFavoriteChange={updateFavorite(service)}
            >
              {service.additionalContent}
            </ServiceCard>
          ))}
        </Grid>
      )}
    </ScrollView>
  );
};

const createStyles = ({ spacing, colors, fontWeights, fontSizes }: Theme) =>
  StyleSheet.create({
    grid: {
      margin: spacing[5],
    },
    betaBadge: {
      position: 'absolute',
      top: -spacing[2],
      right: -spacing[2],
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
  });
