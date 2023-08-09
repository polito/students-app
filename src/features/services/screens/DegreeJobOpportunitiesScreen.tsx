import { useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Card } from '@lib/ui/components/Card';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
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
        {isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <Card style={styles.card}>
            <Text variant="subHeading" style={styles.subHeading}>
              {degree?.objectives?.title}
            </Text>
            <Text>{getHtmlTextContent(degree?.objectives?.content ?? '')}</Text>
          </Card>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, palettes }: Theme) =>
  StyleSheet.create({
    card: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    list: { paddingBottom: spacing[6] * 2 },
    subHeading: {
      color: palettes.info['700'],
      marginBottom: spacing[2],
    },
    loader: {
      marginVertical: spacing[8],
    },
  });
