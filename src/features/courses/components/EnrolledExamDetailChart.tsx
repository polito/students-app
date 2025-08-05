import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { BarChart, barDataItem } from 'react-native-gifted-charts';

import { Col } from '@lib/ui/components/Col';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import type { Theme } from '@lib/ui/types/Theme';
import type { CourseStatistics } from '@polito/api-client';

import { emptyChartData, kChartAnimationDuration } from '../chartConstant.ts';
import { LegendItem } from './LegendItem.tsx';
import { NoChartDataContainer } from './NoChartDataContainer';

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
  const topLabelSpacing = spacing['3'];
  const barRadius = spacing[1];

  const initialSpacing = spacing['4'];
  const graphSpacing = 14;

  const barWidth = (width - initialSpacing - 4 - graphSpacing) / 4;

  const barData: barDataItem[] = [
    {
      value: statistics?.firstYear?.succeeded ?? 0,
      label: t('courseStatisticsScreen.enrolledExamChartLabel.firstYear'),
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
      value: statistics?.otherYears?.succeeded ?? 0,
      label: t('courseStatisticsScreen.enrolledExamChartLabel.otherYears'),
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

  const hasData = barData.some(it => it.value !== undefined && it.value > 0);

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
          initialSpacing={initialSpacing}
          data={hasData ? barData : emptyChartData}
          barWidth={barWidth}
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
          maxValue={Math.max(...barData.map(d => d.value || 0)) * 1.1}
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

const createStyles = ({ spacing, colors, fontSizes }: Theme) =>
  StyleSheet.create({
    graphCard: {
      padding: spacing[4],
    },
    chartAxisLabel: {
      fontSize: fontSizes['2xs'],
      color: colors.title,
    },
  });
