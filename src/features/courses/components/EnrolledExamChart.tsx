import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { BarChart, barDataItem } from 'react-native-gifted-charts';

import { Col } from '@lib/ui/components/Col.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { useTheme } from '@lib/ui/hooks/useTheme.ts';
import type { Theme } from '@lib/ui/types/Theme.ts';
import type { CourseStatistics } from '@polito/api-client';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext.ts';
import { emptyChartData, kChartAnimationDuration } from '../chartConstant.ts';
import { LegendItem } from './LegendItem.tsx';
import { NoChartDataContainer } from './NoChartDataContainer.tsx';

type VisualizationMode = 'single' | 'compare';
export const EnrolledExamChart = ({
  statistics,
  width,
  noOfSections,
}: {
  width: number;
  statistics: undefined | CourseStatistics;
  noOfSections?: number;
}) => {
  const { dark, palettes, colors, fontSizes, spacing } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { fontWeights } = useTheme();

  const selectedSwitchColor = dark ? palettes.primary[600] : colors.surface;
  const chartColors = [palettes.green[500], palettes.red[500]];
  const topLabelSpacing = spacing['1'];
  const barRadius = spacing[1];
  const [mode, setMode] = useState<VisualizationMode>('single');

  const { setFeedback } = useFeedbackContext();
  let initialSpacing = spacing['4'];

  let graphSpacing = 14;

  let barWidth =
    (width -
      initialSpacing -
      ((statistics?.previousYearsToCompare?.length ?? 0) + 1) * 2 -
      (statistics?.previousYearsToCompare?.length ?? 0) * graphSpacing) /
    (((statistics?.previousYearsToCompare?.length ?? 0) + 1) * 2);

  let barData: barDataItem[] = [];

  if (mode === 'single') {
    initialSpacing = width / 6;
    barWidth = width / 3;
    graphSpacing = width / 10;
    barData = [
      {
        value: statistics?.totalSucceeded ?? 0,
        frontColor: palettes.green[500],
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: fontSizes['2xs'],
              marginBottom: topLabelSpacing,
              fontWeight: fontWeights.medium,
            }}
          >
            {statistics?.totalSucceeded ?? 0}
          </Text>
        ),
      },
      {
        value: statistics?.totalFailed ?? 0,
        frontColor: palettes.red[500],
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: fontSizes['2xs'],
              marginBottom: topLabelSpacing,
              fontWeight: fontWeights.medium,
            }}
          >
            {statistics?.totalFailed ?? 0}
          </Text>
        ),
      },
    ];
  }

  if (mode === 'compare') {
    const prevYears =
      statistics?.previousYearsToCompare
        ?.sort((a, b) => a.year - b.year)
        .flatMap(prevYear => {
          return [
            {
              year: prevYear.year,
              value: prevYear.succeeded,
              label: `${prevYear.year - 1} - ${prevYear.year}`,
              spacing: 2,
              labelWidth: 100,
              labelTextStyle: {
                fontSize: fontSizes['2xs'],
                position: 'relative',
                textAlign: 'left',
                left: barWidth / 2 + (barWidth > 60 ? 10 : 0),
                color: colors.title,
              },
              frontColor: `${palettes.green[500]}a6`,
              topLabelComponent: () => (
                <Text
                  style={{
                    fontSize: fontSizes['2xs'],
                    marginBottom: topLabelSpacing,
                    fontWeight: fontWeights.medium,
                  }}
                >
                  {prevYear.succeeded}
                </Text>
              ),
            },
            {
              value: prevYear.failed,
              frontColor: `${palettes.red[500]}a6`,
              topLabelComponent: () => (
                <Text
                  style={{
                    fontSize: fontSizes['2xs'],
                    marginBottom: topLabelSpacing,
                    fontWeight: fontWeights.medium,
                  }}
                >
                  {prevYear.failed}
                </Text>
              ),
            },
          ];
        }) ?? [];

    barData = [
      ...prevYears,
      {
        value: statistics?.totalSucceeded ?? 0,
        label: `${statistics ? statistics?.year - 1 : 0} - ${
          statistics?.year ?? 0
        }`,
        spacing: 2,
        labelWidth: 100,
        labelTextStyle: {
          fontSize: fontSizes['2xs'],
          position: 'relative',
          textAlign: 'left',
          left: barWidth / 2 + (barWidth > 60 ? 10 : 0),
          color: colors.title,
        },
        frontColor: palettes.green[500],
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: fontSizes['2xs'],
              marginBottom: topLabelSpacing,
              fontWeight: fontWeights.medium,
            }}
          >
            {statistics?.totalSucceeded ?? 0}
          </Text>
        ),
      },
      {
        value: statistics?.totalFailed ?? 0,
        frontColor: palettes.red[500],
        topLabelComponent: () => (
          <Text
            style={{
              fontSize: fontSizes['2xs'],
              marginBottom: topLabelSpacing,
              fontWeight: fontWeights.medium,
            }}
          >
            {statistics?.totalFailed ?? 0}
          </Text>
        ),
      },
    ];
  }

  const onChangeVisualizationMode = (nextMode: VisualizationMode) => {
    if (nextMode === mode) {
      return;
    }

    if (
      nextMode === 'compare' &&
      (statistics?.previousYearsToCompare === undefined ||
        statistics?.previousYearsToCompare?.length === 0)
    ) {
      setFeedback({
        text: t('courseStatisticsScreen.enrolledExamVisualization.error'),
      });
      return;
    }

    setMode(nextMode);
  };

  const hasData = barData.some(it => it.value !== undefined && it.value > 0);

  return (
    <View
      style={styles.graphCard}
      accessible={false}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ justifyContent: 'flex-end', marginBottom: spacing[4] }}>
        <Text
          accessibilityLabel={t(
            'courseStatisticsScreen.enrolledExamVisualization.title',
          )}
          style={styles.buttonSwitchTitle}
        >
          {t('courseStatisticsScreen.enrolledExamVisualization.title')}
        </Text>
        <View style={styles.buttonSwitch}>
          <Text
            onPress={() => onChangeVisualizationMode('single')}
            accessibilityLabel={t(
              'courseStatisticsScreen.enrolledExamVisualization.single',
            )}
            style={{
              ...styles.buttonSwitchLabel,
              backgroundColor:
                mode === 'single' ? selectedSwitchColor : undefined,
              color: mode !== 'single' ? colors.secondaryText : colors.title,
            }}
          >
            {t('courseStatisticsScreen.enrolledExamVisualization.single')}
          </Text>
          <Text
            onPress={() => onChangeVisualizationMode('compare')}
            accessibilityLabel={t(
              'courseStatisticsScreen.enrolledExamVisualization.compare',
            )}
            style={{
              ...styles.buttonSwitchLabel,
              backgroundColor:
                mode === 'compare' ? selectedSwitchColor : undefined,
              color: mode !== 'compare' ? colors.secondaryText : colors.title,
            }}
          >
            {t('courseStatisticsScreen.enrolledExamVisualization.compare')}
          </Text>
        </View>
      </View>

      <NoChartDataContainer hasData={hasData}>
        <BarChart
          animationDuration={kChartAnimationDuration}
          initialSpacing={initialSpacing}
          data={hasData ? barData : emptyChartData}
          barWidth={hasData ? barWidth : 19}
          barBorderTopLeftRadius={barRadius}
          barBorderTopRightRadius={barRadius}
          spacing={hasData ? graphSpacing : 0}
          isAnimated
          yAxisTextStyle={styles.chartAxisLabel}
          rulesColor={colors.divider}
          yAxisColor="rgba(255,255,255,0)"
          xAxisColor={colors.divider}
          rulesType="solid"
          noOfSections={noOfSections}
        />
      </NoChartDataContainer>

      <Col>
        <LegendItem
          bulletColor={chartColors[0]}
          text={t('courseStatisticsScreen.enrolledExamChartLegend.passed')}
        />
        <LegendItem
          bulletColor={chartColors[1]}
          text={t('courseStatisticsScreen.enrolledExamChartLegend.failed')}
        />
      </Col>
    </View>
  );
};

const createStyles = ({
  dark,
  spacing,
  colors,
  fontSizes,
  fontWeights,
}: Theme) =>
  StyleSheet.create({
    buttonSwitchLabel: {
      fontSize: fontSizes.xs,
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2],
      borderRadius: spacing[1],
      fontWeight: fontWeights.medium,
    },
    buttonSwitchTitle: {
      alignSelf: 'flex-end',
      fontSize: fontSizes.xs,
      marginBottom: spacing[2],
    },
    buttonSwitch: {
      flexDirection: 'row',
      alignSelf: 'flex-end',
      backgroundColor: dark ? colors.surfaceDark : colors.background,
      padding: spacing[1],
      borderRadius: spacing[1.5],
      gap: spacing[1],
    },
    graphCard: {
      padding: spacing[4],
    },
    chartAxisLabel: {
      fontSize: fontSizes['2xs'],
      color: colors.title,
    },
  });
