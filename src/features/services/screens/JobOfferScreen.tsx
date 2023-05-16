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
    location,
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

  const onPressEmail = () => {
    !!email && Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[useGetJobOfferQuery]} manual />}
    >
      <Section>
        <ScreenTitle title={title ?? ''} style={styles.heading} />
      </Section>
      <Card style={styles.card} accessible>
        <Text
          variant="heading"
          style={styles.location}
          weight="bold"
          numberOfLines={1}
        >
          {companyName}
        </Text>
      </Card>
      <Card accessible style={styles.card}>
        {!!contractType && (
          <Text>{t('jobOfferScreen.contractType', { contractType })}</Text>
        )}
        {!!location && (
          <Text>{t('jobOfferScreen.location', { location })}</Text>
        )}
        {!!endsAtDate && (
          <Text>
            {t('jobOfferScreen.endsAtDate')}
            {formatDate(endsAtDate)}
          </Text>
        )}
        {!!freePositions && (
          <Text>{t('jobOfferScreen.freePositions', { freePositions })}</Text>
        )}
        {!!url && (
          <Text numberOfLines={1} accessibilityRole="link">
            {t('jobOfferScreen.url')}
            <Text onPress={onPressUrl} style={styles.textLink}>
              {url}
            </Text>
          </Text>
        )}
        {!!email && (
          <Text>
            {t('jobOfferScreen.email')}
            <Text onPress={onPressEmail} style={styles.textLink}>
              {email}
            </Text>
          </Text>
        )}
      </Card>
      <Card style={styles.card} accessible>
        <Text variant="subHeading">{t('jobOfferScreen.description')}</Text>
        <Text>{companyMission ?? ' - '}</Text>
        <Text variant="subHeading">{t('jobOfferScreen.requirements')}</Text>
        <Text>{requirements ? sanitizeHtml(requirements) : ' - '}</Text>
      </Card>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    location: {
      marginTop: 0,
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
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[2],
    },
  });
