import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Card } from '@lib/ui/components/Card';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getHtmlTextContent } from '../../../utils/html';
import { DegreeContext } from '../context/DegreeContext';

export const DegreeInfoScreen = () => {
  const { degreeId, year } = useContext(DegreeContext);
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const degreeQuery = useGetOfferingDegree({
    degreeId: degreeId as string,
    year,
  });
  const degree = degreeQuery?.data?.data;
  const isLoading = degreeQuery.isLoading;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[degreeQuery]} manual />}
      contentContainerStyle={{ paddingBottom: spacing[8] }}
    >
      <SafeAreaView>
        {isLoading ? (
          <ActivityIndicator
            style={{
              marginVertical: spacing[8],
            }}
          />
        ) : (
          <>
            <Section>
              <ScreenTitle
                style={styles.heading}
                title={degree?.name || degree?.id}
              />
              <Card style={styles.card}>
                {degree?.location && (
                  <Text style={styles.text}>
                    <Text style={styles.label}>{t('common.location')}: </Text>
                    <Text style={styles.value}>{degree?.location}</Text>
                  </Text>
                )}
                {degree?.department?.name && (
                  <Text style={styles.text}>
                    <Text style={styles.label}>{t('common.department')}: </Text>
                    <Text style={styles.value}>{degree?.department?.name}</Text>
                  </Text>
                )}
                {degree?.duration && (
                  <Text style={styles.text}>
                    <Text style={styles.label}>{t('common.duration')}: </Text>
                    <Text style={styles.value}>{degree?.duration}</Text>
                  </Text>
                )}
              </Card>
            </Section>
            <Section>
              <Card style={styles.card}>
                <Text
                  variant="subHeading"
                  style={[styles.subHeading, { marginTop: 0 }]}
                >
                  {t('common.notes')}
                </Text>
                {degree?.notes?.map((note, index) => (
                  <Text key={index} style={styles.text}>
                    {getHtmlTextContent(note)}
                  </Text>
                ))}
                {degree?.objectives?.content && (
                  <>
                    <Text variant="subHeading" style={styles.subHeading}>
                      {t('common.objectives')}
                    </Text>
                    <Text style={styles.text}>
                      {getHtmlTextContent(degree?.objectives?.content)}
                    </Text>
                  </>
                )}
              </Card>
            </Section>
          </>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, fontWeights, palettes, fontSizes }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[3],
    },
    overviewList: {
      margin: 0,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
    },
    label: {
      fontWeight: fontWeights.semibold,
    },
    text: {
      marginBottom: spacing[1],
    },
    value: {
      fontSize: fontSizes.sm,
    },
    card: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    subHeading: {
      color: palettes.info['700'],
    },
  });
