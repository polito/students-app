import { useTranslation } from 'react-i18next';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getHtmlTextContent } from '../../../utils/html';
import { useDegreeContext } from '../contexts/DegreeContext';

export const DegreeInfoScreen = () => {
  const { degreeId, year } = useDegreeContext();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const degreeQuery = useGetOfferingDegree({ degreeId, year });
  const degree = degreeQuery?.data;
  const isLoading = degreeQuery.isLoading;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[degreeQuery]} manual />}
    >
      <SafeAreaView>
        <LoadingContainer loading={isLoading}>
          <>
            <ScreenTitle
              style={styles.heading}
              title={degree?.name || degree?.id}
            />
            <Card
              padded
              style={styles.overviewCard}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={[
                degree?.location &&
                  `${t('common.location')}: ${degree.location}`,
                degree?.department?.name &&
                  `${t('common.department')}: ${degree.department.name}`,
                degree?.faculty?.name &&
                  `${t('common.faculty')}: ${degree.faculty.name}`,
                degree?.duration &&
                  `${t('common.duration')}: ${degree.duration}`,
                degree?._class &&
                  `${t('degreeScreen.degreeClass')}: ${degree._class.name} (${degree._class.code})`,
              ]
                .filter(Boolean)
                .join(', ')}
            >
              {degree?.location && (
                <Text>
                  <Text style={styles.label}>{t('common.location')}: </Text>
                  <Text>{degree?.location}</Text>
                </Text>
              )}
              {degree?.department?.name && (
                <Text>
                  <Text style={styles.label}>{t('common.department')}: </Text>
                  <Text>{degree?.department?.name}</Text>
                </Text>
              )}
              {degree?.faculty?.name && (
                <Text>
                  <Text style={styles.label}>{t('common.faculty')}: </Text>
                  <Text>{degree?.faculty.name}</Text>
                </Text>
              )}
              {degree?.duration && (
                <Text>
                  <Text style={styles.label}>{t('common.duration')}: </Text>
                  <Text>{degree?.duration}</Text>
                </Text>
              )}
              {degree?._class && (
                <Text>
                  <Text style={styles.label}>
                    {t('degreeScreen.degreeClass')}:{' '}
                  </Text>
                  <Text>
                    {degree?._class.name} ({degree._class.code})
                  </Text>
                </Text>
              )}
            </Card>
          </>
          <Section>
            <Card accessible={false} padded gapped>
              <View
                accessibilityRole="text"
                accessible={true}
                accessibilityLabel={`${t('common.notes')}: ${degree?.notes?.map(note => getHtmlTextContent(note)).join('. ') || t('common.noDataAvailable')}`}
              >
                <Text variant="subHeading">{t('common.notes')}</Text>
                {degree?.notes?.map((note, index) => (
                  <Text
                    key={`note-${note.substring(0, 20)}-${index}`}
                    variant="longProse"
                  >
                    {getHtmlTextContent(note)}
                  </Text>
                ))}
              </View>
              {degree?.objectives?.content && (
                <View
                  accessibilityRole="text"
                  accessible={true}
                  accessibilityLabel={`${t('common.objectives')}: ${getHtmlTextContent(degree.objectives.content)}`}
                >
                  <Text variant="subHeading">{t('common.objectives')}</Text>
                  <Text variant="longProse">
                    {getHtmlTextContent(degree?.objectives?.content)}
                  </Text>
                </View>
              )}
            </Card>
          </Section>
        </LoadingContainer>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, fontWeights, fontSizes }: Theme) =>
  StyleSheet.create({
    overviewCard: {
      gap: spacing[1],
    },
    heading: {
      paddingHorizontal: Platform.select({
        android: spacing[2],
        ios: spacing[4],
      }),
      paddingTop: spacing[3],
    },
    label: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
  });
