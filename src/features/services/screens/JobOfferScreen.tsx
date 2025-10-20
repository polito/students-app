import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import replace from 'react-string-replace';

import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useOpenInAppLink } from '../../../core/hooks/useOpenInAppLink.ts';
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
  const openInAppLink = useOpenInAppLink();
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

  const onPressUrl = (uri: string) => {
    !!uri && openInAppLink(uri);
  };

  const onPressEmail = useCallback(
    (mail: string) => {
      !!mail && openInAppLink(`mailto:${mail}`);
    },
    [openInAppLink],
  );

  const contactInfo = useMemo(() => {
    return replace(
      replace(
        contactInformation ?? '',
        /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
        match => (
          <Text variant="link" onPress={() => onPressEmail(match)} key={match}>
            {match}
          </Text>
        ),
      ),
      /([0-9]{10})/,
      match => (
        <Text
          variant="link"
          onPress={() => Linking.openURL(`tel:${match}`)}
          key={match}
        >
          {match}
        </Text>
      ),
    );
  }, [contactInformation, onPressEmail]);
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[useGetJobOfferQuery]} manual />}
    >
      <SafeAreaView>
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
            <Text variant="longProse" weight="semibold">
              {t('jobOfferScreen.contractType')}
              <Text>{contractType}</Text>
            </Text>
          )}
          {!!salary && (
            <Text variant="longProse" weight="semibold">
              {t('jobOfferScreen.salary')}
              <Text variant="longProse">{salary}</Text>
            </Text>
          )}
          {!!location && (
            <Text variant="longProse" weight="semibold">
              {t('jobOfferScreen.location')}
              <Text>{location}</Text>
            </Text>
          )}
          {!!endsAtDate && (
            <Text variant="longProse" weight="semibold">
              {t('jobOfferScreen.endsAtDate')}
              <Text>{formatDate(endsAtDate)}</Text>
            </Text>
          )}
          {!!freePositions && (
            <Text variant="longProse" weight="semibold">
              {t('jobOfferScreen.freePositions')}
              <Text>{freePositions}</Text>
            </Text>
          )}
        </Card>
        <Card padded gapped>
          <Col
            accessible={true}
            accessibilityLabel={[
              t('jobOfferScreen.description'),
              ' - ',
              companyMission ? companyMission : ' - ',
            ].join(' ')}
          >
            <Text variant="subHeading">{t('jobOfferScreen.description')}</Text>
            <Text variant="longProse">{companyMission ?? ' - '}</Text>
          </Col>
          <Col
            accessible={true}
            accessibilityLabel={[
              t('jobOfferScreen.requirements'),
              ' - ',
              requirements ? requirements : ' - ',
            ].join(' ')}
          >
            <Text variant="subHeading">{t('jobOfferScreen.requirements')}</Text>
            <Text variant="longProse">
              {requirements ? requirements : ' - '}
            </Text>
          </Col>
          <>
            {(contactInfo[0] || email || url) && (
              <Text variant="subHeading">
                {t('jobOfferScreen.application')}
              </Text>
            )}
            {!!url && (
              <Text
                numberOfLines={1}
                accessibilityRole="link"
                weight="semibold"
              >
                {t('jobOfferScreen.url')}
                <Text variant="link" onPress={() => onPressUrl(url)}>
                  {url}
                </Text>
              </Text>
            )}
            {!!contactInfo && <Text>{contactInfo}</Text>}
            {!!email && (
              <Text weight="semibold">
                {t('jobOfferScreen.email')}
                <Text variant="link" onPress={() => onPressEmail(email)}>
                  {email}
                </Text>
              </Text>
            )}
          </>
        </Card>
        <BottomBarSpacer />
      </SafeAreaView>
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
