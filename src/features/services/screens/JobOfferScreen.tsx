import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetJobOffer } from '../../../core/queries/jobOfferHooks';
import { formatDate } from '../../../utils/dates';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'JobOffer'>;

export const JobOfferScreen = ({ route }: Props) => {
  const { id } = route?.params || {};
  const { t } = useTranslation();
  const useGetJobOfferQuery = useGetJobOffer(id);
  const { data: jobOffer } = useGetJobOfferQuery;
  const styles = useStylesheet(createStyles);
  const {
    title,
    location,
    contactInformation,
    companyName,
    contractType,
    endsAtDate,
    freePositions,
    url,
    email,
    companyMission,
    requirements,
    salary,
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
      <Card accessible padded>
        <Text variant="heading" weight="bold" numberOfLines={1}>
          {companyName}
        </Text>
      </Card>
      <Card accessible padded gapped>
        {!!contractType && (
          <Text>{t('jobOfferScreen.contractType', { contractType })}</Text>
        )}
        {!!salary && <Text>{t('jobOfferScreen.salary', { salary })}</Text>}
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
      </Card>
      <Card accessible padded gapped>
        <>
          <Text variant="subHeading">{t('jobOfferScreen.description')}</Text>
          <Text>{companyMission ?? ' - '}</Text>
        </>
        <>
          <Text variant="subHeading">{t('jobOfferScreen.requirements')}</Text>
          <Text>{requirements ? requirements : ' - '}</Text>
        </>
        <>
          <Text variant="subHeading">{t('jobOfferScreen.application')}</Text>
          {!!url && (
            <Text numberOfLines={1} accessibilityRole="link">
              {t('jobOfferScreen.url')}
              <Text variant="link" onPress={onPressUrl}>
                {url}
              </Text>
            </Text>
          )}
          {!!contactInformation && <Text>{contactInformation}</Text>}
          {!!email && (
            <Text>
              {t('jobOfferScreen.email')}
              <Text variant="link" onPress={onPressEmail}>
                {email}
              </Text>
            </Text>
          )}
        </>
      </Card>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[3],
    },
  });
