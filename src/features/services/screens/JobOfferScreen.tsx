import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetJobOffer } from '../../../core/queries/jobOfferHooks';
import { formatDate } from '../../../utils/dates';
import { sanitizeHtml } from '../../../utils/html';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'JobOffer'>;

export const JobOfferScreen = ({ route }: Props) => {
  const { id } = route?.params || {};
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const useGetJobOfferQuery = useGetJobOffer(id);
  const { data: jobOffer } = useGetJobOfferQuery;
  const styles = useStylesheet(createStyles);
  const {
    title,
    companyLocation,
    companyName,
    contractType,
    endsAtDate,
    freePositions,
    url,
    email,
    companyMission,
    requirements,
  } = jobOffer || {};

  const onPressUrl = () => {
    !!url && Linking.openURL(url);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[useGetJobOfferQuery]} />}
    >
      <Section>
        <ScreenTitle title={title ?? ''} style={styles.heading} />
      </Section>
      <Card style={styles.card}>
        <Text
          variant="heading"
          style={styles.location}
          weight="bold"
          numberOfLines={1}
        >
          {companyName}
        </Text>
      </Card>
      <Card style={styles.card}>
        {contractType && (
          <Text style={styles.textInfo}>
            {t('jobOfferScreen.contractType', { contractType })}
          </Text>
        )}
        {companyLocation && (
          <Text style={styles.textInfo}>
            {t('jobOfferScreen.companyLocation', { companyLocation })}
          </Text>
        )}
        {endsAtDate && (
          <Text style={styles.textInfo}>
            {t('jobOfferScreen.endsAtDate')}
            {formatDate(endsAtDate)}
          </Text>
        )}
        {freePositions && (
          <Text style={styles.textInfo}>
            {t('jobOfferScreen.freePositions', { freePositions })}
          </Text>
        )}
        {url && (
          <Text variant="link" style={styles.textInfo} numberOfLines={1}>
            {t('jobOfferScreen.url')}
            <Text onPress={onPressUrl} style={styles.textLink}>
              {url}
            </Text>
          </Text>
        )}
        {email && (
          <Text style={styles.textInfo}>
            {t('jobOfferScreen.email', { email })}
          </Text>
        )}
      </Card>
      <Card style={styles.card}>
        <Text
          variant="subHeading"
          style={[styles.subHeading, { marginTop: spacing[2] }]}
        >
          {t('jobOfferScreen.description')}
        </Text>
        <Text>{companyMission ?? ' - '}</Text>
        <Text variant="subHeading" style={styles.subHeading}>
          {t('jobOfferScreen.requirements')}
        </Text>
        <Text>{requirements ? sanitizeHtml(requirements) : ' - '}</Text>
      </Card>
    </ScrollView>
  );
};

const createStyles = ({ spacing, palettes, fontWeights }: Theme) =>
  StyleSheet.create({
    location: {
      color: palettes.text[900],
      marginTop: 0,
    },
    subHeading: {
      color: palettes.secondary[600],
      fontWeight: fontWeights.bold,
    },
    textInfo: {
      color: palettes.text[800],
      fontWeight: fontWeights.normal,
      marginBottom: spacing[2],
    },
    textLink: {
      textDecorationLine: 'underline',
    },
    heading: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[3],
    },
    card: {
      paddingHorizontal: spacing[2.5],
      paddingVertical: spacing[2],
    },
  });
