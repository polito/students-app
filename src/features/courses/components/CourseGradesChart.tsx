import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';

import { Col } from '@lib/ui/components/Col.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { useTheme } from '@lib/ui/hooks/useTheme.ts';
import type { Theme } from '@lib/ui/types/Theme.ts';
import type { CourseStatistics } from '@polito/api-client';
import { GradeCount } from '@polito/api-client/models/GradeCount';
import { GradeCountGradeEnum } from '@polito/api-client/models/GradeCount.ts';

import { LegendItem } from './LegendItem.tsx';
import { NoChartDataContainer } from './NoChartDataContainer.tsx';

interface PyramidData {
  grade: string;
  firstYearPercentage: number;
  otherYearsPercentage: number;
  firstYearCount: number;
  otherYearsCount: number;
}

const gradesToPyramidData = (
  firstYearGrades: GradeCount[],
  otherYearsGrades: GradeCount[],
  firstYearTotal: number,
  otherYearsTotal: number,
): PyramidData[] => {
  const sortedGrades = Object.values(GradeCountGradeEnum).sort((a, b) => {
    const numA = a === '30L' ? 31 : parseInt(a, 10);
    const numB = b === '30L' ? 31 : parseInt(b, 10);
    return numB - numA;
  });

  return sortedGrades.map(grade => {
    const firstYearGrade = firstYearGrades.find(gc => gc.grade === grade);
    const otherYearsGrade = otherYearsGrades.find(gc => gc.grade === grade);

    const firstYearCount = firstYearGrade ? firstYearGrade.count : 0;
    const otherYearsCount = otherYearsGrade ? otherYearsGrade.count : 0;

    const firstYearPercentage =
      firstYearTotal > 0 ? (firstYearCount / firstYearTotal) * 100 : 0;
    const otherYearsPercentage =
      otherYearsTotal > 0 ? (otherYearsCount / otherYearsTotal) * 100 : 0;

    return {
      grade,
      firstYearPercentage,
      otherYearsPercentage,
      firstYearCount,
      otherYearsCount,
    };
  });
};

export const CourseGradesChart = ({
  statistics,
  width,
}: {
  width: number;
  statistics: undefined | CourseStatistics;
}) => {
  const { palettes, colors, spacing } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  const chartColors = [palettes.secondary[600], palettes.navy[500]];

  const firstYearTotal =
    statistics?.firstYear?.grades?.reduce(
      (sum, grade) => sum + grade.count,
      0,
    ) ?? 0;
  const otherYearsTotal =
    statistics?.otherYears?.grades?.reduce(
      (sum, grade) => sum + grade.count,
      0,
    ) ?? 0;

  const pyramidData = gradesToPyramidData(
    statistics?.firstYear?.grades ?? [],
    statistics?.otherYears?.grades ?? [],
    firstYearTotal,
    otherYearsTotal,
  );

  const hasData = pyramidData.some(
    item => item.firstYearPercentage > 0 || item.otherYearsPercentage > 0,
  );

  const horizontalPadding = 16;
  const chartWidth = width - horizontalPadding * 2 + 100; // Uses almost all available width (+100 to compensate for the different size of the value scale)

  // Dynamic total height
  const barHeight = Math.max(28, Math.min(50, chartWidth * 0.08));
  const chartHeight = pyramidData.length * barHeight + 20; // plus base of pyramid

  const centerX = chartWidth / 2;

  // Maximum width of bars - proportional to total width
  const maxBarWidth = chartWidth * 0.42; // Max 0.42 because it is for 2 sides, plus a central gap, plus side margin

  // Dynamic center space - wider on large screens
  const centralGap = Math.max(20, chartWidth * 0.04);

  // Find the maximum value for scaling - use a default value if no data is available
  const calculatedMaxPercentage = hasData
    ? Math.max(
        ...pyramidData.map(d =>
          Math.max(d.firstYearPercentage, d.otherYearsPercentage),
        ),
      )
    : 0;

  const maxPercentage =
    !hasData || calculatedMaxPercentage === 0 || isNaN(calculatedMaxPercentage)
      ? 100
      : calculatedMaxPercentage;

  // Function to create bar polygons with dynamic dimensions
  const createRoundedBarPath = (
    percentage: number,
    y: number,
    isLeft: boolean,
  ): string => {
    if (isNaN(percentage) || isNaN(y) || percentage <= 0) {
      return '';
    }

    const barWidth = (percentage / maxPercentage) * (maxBarWidth - 10); // (-10)for the percentage

    if (isNaN(barWidth) || barWidth <= 0) {
      return '';
    }

    let radius = Math.min(spacing[1], barHeight * 0.2);
    const height = barHeight - 4; // Spacing between bars

    if (barWidth <= radius * 2) {
      radius = Math.min(spacing[0.5], barWidth * 0.2);
    }

    const bottomY = y + height;

    if (isLeft) {
      const externalSide = centerX - barWidth - centralGap / 2;
      const internalSide = centerX - centralGap / 2;

      return `
        M ${externalSide},${y + radius}
        Q ${externalSide},${y} ${externalSide + radius},${y}
        L ${internalSide},${y}
        L ${internalSide},${bottomY}
        L ${externalSide + radius},${bottomY}
        Q ${externalSide},${bottomY} ${externalSide},${bottomY - radius}
        Z
      `;
    } else {
      const externalSide = centerX + centralGap / 2;
      const internalSide = centerX + barWidth + centralGap / 2;

      return `
        M ${externalSide},${y}
        L ${internalSide - radius},${y}
        Q ${internalSide},${y} ${internalSide},${y + radius}
        L ${internalSide},${bottomY - radius}
        Q ${internalSide},${bottomY} ${internalSide - radius},${bottomY}
        L ${externalSide},${bottomY}
        Z
      `;
    }
  };

  const getPositionPercentage = (percentage: number, isLeft: boolean) => {
    const barWidth = (percentage / maxPercentage) * (maxBarWidth - 10);
    return isLeft
      ? centerX - barWidth - centralGap / 2
      : centerX + barWidth + centralGap / 2;
  };

  const labelFontSize = Math.max(10, Math.min(14, chartWidth * 0.035));
  const percentageFontSize = Math.max(9, Math.min(11, chartWidth * 0.025));

  return (
    <View
      style={styles.graphCard}
      accessible={false}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      <NoChartDataContainer hasData={hasData}>
        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* Center line - always visible */}
            <Line
              x1={centerX}
              y1={0}
              x2={centerX}
              y2={chartHeight}
              stroke={colors.divider}
              strokeWidth="1"
              opacity="0.5"
            />

            {pyramidData.map((item, index) => {
              const y = 10 + index * barHeight;

              return (
                <G key={item.grade}>
                  {/* Left bar (first year) - only if there is data */}
                  {hasData && item.firstYearPercentage > 0 && (
                    <Path
                      d={createRoundedBarPath(
                        item.firstYearPercentage,
                        y,
                        true,
                      )}
                      fill={chartColors[0]}
                      opacity="0.8"
                    />
                  )}

                  {/* Right bar (other years) - only if there is data */}
                  {hasData && item.otherYearsPercentage > 0 && (
                    <Path
                      d={createRoundedBarPath(
                        item.otherYearsPercentage,
                        y,
                        false,
                      )}
                      fill={chartColors[1]}
                      opacity="0.8"
                    />
                  )}

                  {/* Vote label in the center - always visible */}
                  <SvgText
                    x={centerX}
                    y={y + barHeight / 2 + 2}
                    fontSize={labelFontSize}
                    fill={colors.title}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {item.grade}
                  </SvgText>

                  {/* Percentages - only if there is data */}
                  {hasData &&
                    item.firstYearPercentage > 0 &&
                    !isNaN(item.firstYearPercentage) && (
                      <SvgText
                        x={
                          getPositionPercentage(
                            item.firstYearPercentage,
                            true,
                          ) - 15
                        }
                        y={y + barHeight / 2 + 1}
                        fontSize={percentageFontSize}
                        fill={colors.title}
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {item.firstYearPercentage.toFixed(1) + '%'}
                      </SvgText>
                    )}

                  {hasData &&
                    item.otherYearsPercentage > 0 &&
                    !isNaN(item.otherYearsPercentage) && (
                      <SvgText
                        x={
                          getPositionPercentage(
                            item.otherYearsPercentage,
                            false,
                          ) + 15
                        }
                        y={y + barHeight / 2 + 1}
                        fontSize={percentageFontSize}
                        fill={colors.title}
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {item.otherYearsPercentage.toFixed(1) + '%'}
                      </SvgText>
                    )}
                </G>
              );
            })}
          </Svg>
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
          trailingText={statistics?.firstYear?.averageGrade?.toString() ?? '-'}
        />
        <LegendItem
          bulletColor={chartColors[1]}
          text={t('courseStatisticsScreen.gradesDetailLegend.otherYears')}
          trailingText={statistics?.otherYears?.averageGrade?.toString() ?? '-'}
        />
      </Col>
    </View>
  );
};

const createStyles = ({ spacing, colors, fontSizes, fontWeights }: Theme) =>
  StyleSheet.create({
    graphCard: {
      padding: spacing[4],
    },
    chartContainer: {
      marginVertical: spacing[1],
      alignItems: 'center',
    },
    chartTitle: {
      alignSelf: 'flex-end',
      fontSize: fontSizes.xs,
      marginBottom: spacing[2],
      fontWeight: fontWeights.medium,
      color: colors.title,
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
  });
