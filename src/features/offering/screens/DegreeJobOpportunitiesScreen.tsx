import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getHtmlTextContent } from '../../../utils/html';
import { useDegreeContext } from '../contexts/DegreeContext';

export const DegreeJobOpportunitiesScreen = () => {
  const { t } = useTranslation();
  const { degreeId, year } = useDegreeContext();
  const degreeQuery = useGetOfferingDegree({ degreeId, year });
  const styles = useStylesheet(createStyles);
  const degree = degreeQuery?.data;
  const isLoading = degreeQuery.isLoading;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[degreeQuery]} manual />}
      contentContainerStyle={styles.list}
    >
      <SafeAreaView>
        <LoadingContainer loading={isLoading}>
          <Section>
            <Card
              padded
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`${t('degreeJobOpportunitiesScreen.jobOpportunities')} - ${degree?.jobOpportunities?.title || ''}`}
            >
              <Text
                variant="subHeading"
                style={styles.subHeading}
                accessible={true}
                accessibilityRole="header"
              >
                {degree?.jobOpportunities?.title}
              </Text>
              <Text variant="longProse">
                {getHtmlTextContent(degree?.jobOpportunities?.content ?? '')}
              </Text>
            </Card>
          </Section>
        </LoadingContainer>
      </SafeAreaView>
      <BottomBarSpacer />
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    card: {
      marginTop: Platform.select({ android: spacing[4] }),
      paddingHorizontal: spacing[2.5],
      paddingVertical: spacing[2.5],
    },
    list: {
      paddingTop: spacing[2],
    },
    subHeading: {
      marginBottom: spacing[2],
    },
  });
