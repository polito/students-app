import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Metric } from '@lib/ui/components/Metric';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { BottomModal } from '../../../core/components/BottomModal';
import { useBottomModal } from '../../../core/hooks/useBottomModal';
import {
  useGetGrades,
  useGetStudent,
} from '../../../core/queries/studentHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import {
  formatExamOnTime,
  formatFinalGrade,
  formatThirtiethsGrade,
} from '../../../utils/grades';
import { ProgressChart } from '../../teaching/components/ProgressChart';
import { CareerScreenModal } from '../components/CareerScreenModal';

export const CareerScreen = () => {
  const { t } = useTranslation();
  const { palettes, colors, dark } = useTheme();
  const styles = useStylesheet(createStyles);
  const studentQuery = useGetStudent();
  const gradesQuery = useGetGrades();
  const {
    enrollmentCredits,
    enrollmentAttendedCredits,
    enrollmentAcquiredCredits,
    totalAttendedCredits,
    totalAcquiredCredits,
    totalCredits,
    mastersAdmissionAverageGrade,
    excludedCreditsNumber,
    usePurgedAverageFinalGrade,
    totalOnTimeExamPoints,
    maxOnTimeExamPoints,
  } = studentQuery.data ?? {};

  const {
    open: showBottomModal,
    modal: bottomModal,
    close: closeBottomModal,
  } = useBottomModal();

  const onPressAverageEvent = () => {
    showBottomModal(
      <CareerScreenModal
        title={t('transcriptMetricsScreen.averagesAndGrades')}
        itemList={[
          usePurgedAverageFinalGrade
            ? {
                title: t('transcriptMetricsScreen.averageLabel'),
                content: {
                  description: t(
                    'transcriptMetricsScreen.finalAverageLabelDescription.description',
                    {
                      excludedCreditsNumber: excludedCreditsNumber,
                    },
                  ),
                  formula: t(
                    'transcriptMetricsScreen.finalAverageLabelDescription.formula',
                    {
                      excludedCreditsNumber: excludedCreditsNumber,
                    },
                  ),
                },
                dot: true,
              }
            : {
                title: t('transcriptMetricsScreen.averageLabel'),
                content: {
                  description: t(
                    'transcriptMetricsScreen.weightedAverageLabelDescription.description',
                  ),
                  formula: t(
                    'transcriptMetricsScreen.weightedAverageLabelDescription.formula',
                  ),
                },
                dot: true,
              },
          mastersAdmissionAverageGrade
            ? {
                title: t('transcriptMetricsScreen.masterAdmissionAverage'),
                content: {
                  description: t(
                    'transcriptMetricsScreen.masterAdmissionAverageLabelDescription.description',
                  ),
                  formula: t(
                    'transcriptMetricsScreen.masterAdmissionAverageLabelDescription.formula',
                  ),
                },
                dot: true,
              }
            : { title: '', content: { description: '' }, dot: false },
          {
            content: {
              description: t('transcriptMetricsScreen.laude'),
            },
            dot: false,
          },
          {
            title: t('transcriptMetricsScreen.NB'),
            content: {
              description: t('transcriptMetricsScreen.NBDescription'),
            },
            dot: false,
          },
        ]}
        onDismiss={closeBottomModal}
      />,
    );
  };

  const onPressPointEvent = () => {
    showBottomModal(
      <CareerScreenModal
        title={t('transcriptMetricsScreen.pointTitle')}
        itemList={[
          {
            title: t('transcriptMetricsScreen.onTimeScores'),
            content: {
              description: t('transcriptMetricsScreen.pointModal'),
            },
            dot: false,
          },
        ]}
        onDismiss={closeBottomModal}
      />,
    );
  };

  return (
    <>
      <BottomModal dismissable {...bottomModal} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl queries={[studentQuery, gradesQuery]} manual />
        }
      >
        <SafeAreaView>
          <Section>
            <SectionHeader title={t('transcriptMetricsScreen.yourCareer')} />
            <Card style={styles.chartCard} accessible={true}>
              <View style={GlobalStyles.grow}>
                <Metric
                  title={t('transcriptMetricsScreen.acquiredCreditsLabel')}
                  value={`${totalAcquiredCredits ?? '--'}/${
                    totalCredits ?? '--'
                  } CFU`}
                  style={styles.spaceBottom}
                  accessibilityLabel={`${t(
                    'transcriptMetricsScreen.acquiredCreditsLabel',
                  )}: ${totalAcquiredCredits} ${t(
                    'common.of',
                  )} ${totalCredits}`}
                />
                <Metric
                  title={t('transcriptMetricsScreen.attendedCreditsLabel')}
                  value={`${totalAttendedCredits ?? '--'}/${
                    totalCredits ?? '--'
                  } CFU`}
                  color={palettes.primary[400]}
                  accessibilityLabel={`${t(
                    'transcriptMetricsScreen.attendedCreditsLabel',
                  )}: ${totalAttendedCredits} ${t(
                    'common.of',
                  )} ${totalCredits}`}
                />
              </View>
              <ProgressChart
                data={
                  totalCredits
                    ? [
                        (totalAttendedCredits ?? 0) / totalCredits,
                        (totalAcquiredCredits ?? 0) / totalCredits,
                      ]
                    : []
                }
                colors={[palettes.primary[400], palettes.secondary[500]]}
              />
            </Card>
          </Section>

          <Section>
            <SectionHeader title={t('transcriptMetricsScreen.thisYear')} />
            <Card style={styles.chartCard} accessible={true}>
              <View style={GlobalStyles.grow}>
                <Metric
                  title={t('transcriptMetricsScreen.acquiredCreditsLabel')}
                  value={`${enrollmentAcquiredCredits ?? '--'}/${
                    enrollmentCredits ?? '--'
                  } CFU`}
                  accessibilityLabel={`${t(
                    'transcriptMetricsScreen.acquiredCreditsLabel',
                  )}: ${enrollmentAcquiredCredits} ${t(
                    'common.of',
                  )} ${enrollmentCredits}`}
                  style={styles.spaceBottom}
                />
                <Metric
                  title={t('transcriptMetricsScreen.attendedCreditsLabel')}
                  value={`${enrollmentAttendedCredits ?? '--'}/${
                    enrollmentCredits ?? '--'
                  } CFU`}
                  accessibilityLabel={`${t(
                    'transcriptMetricsScreen.attendedCreditsLabel',
                  )}: ${enrollmentCredits} ${t(
                    'common.of',
                  )} ${enrollmentCredits}`}
                  color={palettes.primary[400]}
                />
              </View>
              <ProgressChart
                data={
                  enrollmentCredits
                    ? [
                        (enrollmentAttendedCredits ?? 0) / enrollmentCredits,
                        (enrollmentAcquiredCredits ?? 0) / enrollmentCredits,
                      ]
                    : []
                }
                colors={[palettes.primary[400], palettes.secondary[500]]}
              />
            </Card>
          </Section>

          <Section>
            <SectionHeader
              title={t('transcriptMetricsScreen.averagesAndGrades')}
              trailingIcon={{
                onPress: onPressAverageEvent,
                icon: faQuestionCircle,
                color: colors.link,
              }}
            />
            <Card style={styles.metricsCard} accessible={true}>
              <Col>
                <Row>
                  <Text style={styles.title}>
                    {t('transcriptMetricsScreen.averageLabel')}
                  </Text>
                </Row>
                <Row>
                  <Metric
                    value={formatFinalGrade(
                      usePurgedAverageFinalGrade
                        ? studentQuery.data?.estimatedFinalGradePurged
                        : studentQuery.data?.estimatedFinalGrade,
                    )}
                    color={palettes.primary[400]}
                    style={GlobalStyles.grow}
                  />
                </Row>

                {studentQuery.data?.mastersAdmissionAverageGrade && (
                  <>
                    <Row style={styles.additionalMetric}>
                      <Text style={styles.title}>
                        {t('transcriptMetricsScreen.masterAdmissionAverage')}
                      </Text>
                    </Row>
                    <Row>
                      <Metric
                        value={formatThirtiethsGrade(
                          studentQuery.data?.mastersAdmissionAverageGrade,
                        )}
                        style={GlobalStyles.grow}
                      />
                    </Row>
                  </>
                )}
              </Col>
            </Card>
          </Section>
          {totalOnTimeExamPoints && maxOnTimeExamPoints && (
            <Section>
              <SectionHeader
                title={t('transcriptMetricsScreen.pointTitle')}
                trailingIcon={{
                  onPress: onPressPointEvent,
                  icon: faQuestionCircle,
                  color: colors.link,
                }}
              />
              <Card style={styles.metricsCard} accessible={true}>
                <Metric
                  title={t('transcriptMetricsScreen.onTimeScores')}
                  value={formatExamOnTime(
                    totalOnTimeExamPoints,
                    maxOnTimeExamPoints,
                  )}
                  style={GlobalStyles.grow}
                  color={palettes.success[dark ? 400 : 700]}
                />
              </Card>
            </Section>
          )}
          <BottomBarSpacer />
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

const createStyles = ({ spacing, fontSizes, fontWeights }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
    chartCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      marginTop: spacing[2],
      marginBottom: spacing[3],
    },
    metricsCard: {
      padding: spacing[4],
      marginTop: spacing[2],
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    additionalMetric: {
      marginTop: spacing[4],
    },
    grade: {
      marginLeft: spacing[2],
    },
    title: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.normal,
    },
  });
