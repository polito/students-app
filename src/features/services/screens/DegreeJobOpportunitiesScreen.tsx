import { useContext } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getHtmlTextContent } from '../../../utils/html';
import { DegreeContext } from '../context/DegreeContext';

export const DegreeJobOpportunitiesScreen = () => {
  const { degreeId, year } = useContext(DegreeContext);
  const degreeQuery = useGetOfferingDegree({
    degreeId: degreeId as string,
    year,
  });
  const styles = useStylesheet(createStyles);
  const degree = degreeQuery?.data?.data;
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
            <Card style={styles.card}>
              <Text variant="subHeading" style={styles.subHeading}>
                {degree?.objectives?.title}
              </Text>
              <Text>
                {getHtmlTextContent(degree?.objectives?.content ?? '')}
              </Text>
            </Card>
          </Section>
        </LoadingContainer>
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, palettes }: Theme) =>
  StyleSheet.create({
    card: {
      marginTop: Platform.select({ android: spacing[4] }),
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    list: {
      paddingBottom: spacing[8],
    },
    subHeading: {
      color: palettes.info['700'],
      marginBottom: spacing[2],
    },
  });
