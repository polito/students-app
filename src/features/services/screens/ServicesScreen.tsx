import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  faComments,
  faIdCard,
  faMobileScreenButton,
} from '@fortawesome/free-solid-svg-icons';
import { Grid, auto } from '@lib/ui/components/Grid';
import { Text } from '@lib/ui/components/Text';
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
      additionalContent: (
        <>
          <View style={styles.betaRibbon}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </>
      ),
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
    listContainer: {
      paddingVertical: spacing[5],
      paddingHorizontal: spacing[2.5],
      flexWrap: 'wrap',
    },
    betaRibbon: {
      position: 'absolute',
      resizeMode: 'contain',
      top: -spacing[1],
      left: -spacing[5],
      width: 90,
      backgroundColor: colors.darkOrange[400],
      transform: [{ rotate: '-42deg' }],
    },
    betaText: {
      color: colors.text[50],
      fontWeight: fontWeights.semibold,
      paddingHorizontal: spacing[3.5],
      fontSize: fontSizes.xs,
    },
    disabled: {
      opacity: 0.8,
    },
    titleStyle: {
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      fontSize: fontSizes.sm,
    },
    section: {
      marginBottom: spacing[5],
    },
    loader: {
      marginVertical: spacing[8],
    },
    sectionContent: {
      marginVertical: spacing[2],
    },
  });
