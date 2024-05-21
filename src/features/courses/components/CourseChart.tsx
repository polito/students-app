import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { BarChart, LineChart, barDataItem } from 'react-native-gifted-charts';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import type { Theme } from '@lib/ui/types/Theme';
import type { CourseStatistics } from '@polito/api-client';
import {
  GradeCount,
  GradeCountGradeEnum,
} from '@polito/api-client/models/GradeCount';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { NoChartDataContainer } from './NoChartDataContainer';

const kChartAnimationDuration = 200; // ms

const emptyChartData = [
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
  { value: 0, frontColor: 'transparent' },
];

const LegendItem = ({
  bulletColor,
  text,
  trailingText,
}: {
  bulletColor: string;
  text: string;
  trailingText?: string;
}) => {
  const styles = useStylesheet(createStyles);
  return (
    <Row gap={2} style={{ alignItems: 'center' }}>
      <View
        style={{
          ...styles.chartLegendBullet,
          backgroundColor: bulletColor,
        }}
      />
      <Text
        variant="prose"
        style={styles.chartLegendText}
        accessibilityLabel={text}
      >
        {text}
      </Text>
      {trailingText && (
        <Text
          variant="prose"
          style={styles.chartLegendTrailingText}
          accessibilityLabel={trailingText}
        >
          {trailingText}
        </Text>
      )}
    </Row>
  );
};

// groups "grade counts" by "grade value" and returns the list of the sums sorted by grade
// E.g.
// Think of our grades as a list: [18, 19, 20, ...]
// This helper will return [howMany18, howMany19, ...]
const gradesToChartValues = (gradeCounts: GradeCount[]) => {
  const groupedCounts: {
    [key in string]: number;
  } = {};
  for (const value of Object.values(GradeCountGradeEnum)) {
    groupedCounts[value] = 0;
  }

  for (const gradeCount of gradeCounts) {
    groupedCounts[gradeCount.grade] += gradeCount.count;
  }
  return Object.values(groupedCounts).map(it => ({ value: it }));
};

export const CourseGradesChart = ({
  statistics,
  width,
}: {
  width: number;
  statistics: undefined | CourseStatistics;
}) => {
  const { palettes, colors } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const chartColors = [
    palettes.secondary[600],
    palettes.navy[500],
    palettes.navy[100],
  ];

  const data = gradesToChartValues(statistics?.firstYear?.grades ?? []);
  const data1 = gradesToChartValues(statistics?.secondYear?.grades ?? []);
  const data2 = gradesToChartValues(statistics?.otherYears?.grades ?? []);

  const hasData = [...data, ...data1, ...data2].some(e => e.value > 0);
  const maxYValue = Math.max(
    ...[...data, ...data1, ...data2].map(it => it.value),
  );

  return (
    <View style={styles.graphCard}>
      <NoChartDataContainer hasData={hasData}>
        <View
          accessible={false}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          <LineChart
            initialSpacing={width / (data.length + 1)}
            width={width}
            data={hasData ? data : emptyChartData}
            data2={hasData ? data1 : undefined}
            data3={hasData ? data2 : undefined}
            color={hasData ? chartColors[0] : 'transparent'}
            dataPointsColor={hasData ? chartColors[0] : 'transparent'}
            color2={chartColors[1]}
            dataPointsColor2={chartColors[1]}
            color3={chartColors[2]}
            dataPointsColor3={chartColors[2]}
            xAxisLabelTexts={Object.values(GradeCountGradeEnum)}
            xAxisLabelTextStyle={styles.chartAxisLabel}
            yAxisTextStyle={styles.chartAxisLabel}
            rulesColor={colors.divider}
            yAxisColor={colors.divider}
            xAxisColor={colors.divider}
            showVerticalLines
            rulesType="solid"
            spacing={width / (data.length + 1)}
            maxValue={maxYValue}
            yAxisLabelTexts={
              hasData
                ? undefined
                : ['0', '2', '4', '6', '8', '11', '13', '15', '17', '20', '24']
            }
          />
        </View>
      </NoChartDataContainer>
      <Col>
        <Text
          variant="prose"
          style={styles.gradesChartLegendTitle}
          accessibilityLabel={t(
            'courseStatisticsScreen.gradesDetailLegend.averageGrade',
          )}
        >
          {t('courseStatisticsScreen.gradesDetailLegend.averageGrade')}
        </Text>
        <LegendItem
          bulletColor={chartColors[0]}
          text={t('courseStatisticsScreen.gradesDetailLegend.firstYear')}
          trailingText={statistics?.firstYear?.averageGrade?.toString()}
        />
        <LegendItem
          bulletColor={chartColors[1]}
          text={t('courseStatisticsScreen.gradesDetailLegend.secondYear')}
          trailingText={statistics?.secondYear?.averageGrade?.toString()}
        />
        <LegendItem
          bulletColor={chartColors[2]}
          text={t('courseStatisticsScreen.gradesDetailLegend.otherYears')}
          trailingText={statistics?.otherYears?.averageGrade?.toString()}
        />
      </Col>
    </View>
  );
};

export const EnrolledExamDetailChart = ({
  statistics,
  width,
  noOfSections,
}: {
  width: number;
  statistics: undefined | CourseStatistics;
  noOfSections?: number;
}) => {
  const { palettes, colors, fontSizes, spacing } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { fontWeights } = useTheme();
  const chartColors = [palettes.green[500], palettes.red[500]];
  const topLabelSpacing = spacing['1'];
  const barRadius = spacing[1];

  const barData: barDataItem[] = [
    {
      value: statistics?.firstYear?.succeeded ?? 0,
      label: t('courseStatisticsScreen.enrolledExamChartLabel.firstYear'),
      spacing: 2,
      labelWidth: 40,
      labelTextStyle: {
        fontSize: fontSizes['2xs'],
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
          {statistics?.firstYear?.succeeded ?? 0}
        </Text>
      ),
    },
    {
      value: statistics?.firstYear?.failed ?? 0,
      frontColor: palettes.red[500],
      topLabelComponent: () => (
        <Text
          style={{
            fontSize: fontSizes['2xs'],
            marginBottom: topLabelSpacing,
            fontWeight: fontWeights.medium,
          }}
        >
          {statistics?.firstYear?.failed ?? 0}
        </Text>
      ),
    },
    {
      value: statistics?.secondYear?.succeeded ?? 0,
      label: t('courseStatisticsScreen.enrolledExamChartLabel.secondYear'),
      spacing: 2,
      labelWidth: 40,
      labelTextStyle: {
        fontSize: fontSizes['2xs'],
        position: 'relative',
        left: '-5%',
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
          {statistics?.secondYear?.succeeded ?? 0}
        </Text>
      ),
    },
    {
      value: statistics?.secondYear?.failed ?? 0,
      frontColor: palettes.red[500],
      topLabelComponent: () => (
        <Text
          style={{
            fontSize: fontSizes['2xs'],
            marginBottom: topLabelSpacing,
            fontWeight: fontWeights.medium,
          }}
        >
          {statistics?.secondYear?.failed ?? 0}
        </Text>
      ),
    },
    {
      value: statistics?.otherYears?.succeeded ?? 0,
      label: t('courseStatisticsScreen.enrolledExamChartLabel.otherYears'),
      spacing: 2,
      labelWidth: 80,
      labelTextStyle: {
        fontSize: fontSizes['2xs'],
        position: 'relative',
        left: '-25%',
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
          {statistics?.otherYears?.succeeded ?? 0}
        </Text>
      ),
    },
    {
      value: statistics?.otherYears?.failed ?? 0,
      frontColor: palettes.red[500],
      topLabelComponent: () => (
        <Text
          style={{
            fontSize: fontSizes['2xs'],
            marginBottom: topLabelSpacing,
            fontWeight: fontWeights.medium,
          }}
        >
          {statistics?.otherYears?.failed ?? 0}
        </Text>
      ),
    },
  ];

  const hasData = barData.some(it => it.value > 0);

  return (
    <View
      style={styles.graphCard}
      accessible={false}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      <NoChartDataContainer hasData={hasData}>
        <BarChart
          animationDuration={kChartAnimationDuration}
          initialSpacing={20}
          data={hasData ? barData : emptyChartData}
          barWidth={20}
          barBorderTopLeftRadius={barRadius}
          barBorderTopRightRadius={barRadius}
          spacing={hasData ? width / 5 : 1}
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
    graphSpacing = width / 8;
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

  const hasData = barData.some(it => it.value > 0);

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
    gradesChartLegendTitle: {
      textAlign: 'right',
      fontSize: fontSizes.xs,
      marginVertical: spacing['4'],
    },
    chartAxisLabel: {
      fontSize: fontSizes['2xs'],
      color: colors.title,
    },
    chartLegendBullet: {
      height: 8,
      width: 8,
      borderRadius: 8,
    },
    chartLegendText: {
      fontSize: fontSizes.xs,
    },
    chartLegendTrailingText: {
      marginLeft: 'auto',
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
  });
