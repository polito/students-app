import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { Col } from '@lib/ui/components/Col.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { useTheme } from '@lib/ui/hooks/useTheme.ts';
import type { Theme } from '@lib/ui/types/Theme.ts';
import type { CourseStatistics } from '@polito/api-client';
import { GradeCount } from '@polito/api-client/models/GradeCount';
import { GradeCountGradeEnum } from '@polito/api-client/models/GradeCount.ts';

import { emptyChartData } from '../chartConstant.ts';
import { LegendItem } from './LegendItem.tsx';
import { NoChartDataContainer } from './NoChartDataContainer.tsx';

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
  const data1 = gradesToChartValues(statistics?.otherYears?.grades ?? []);

  const hasData = [...data, ...data1].some(e => e.value > 0);
  const maxYValue = Math.max(...[...data, ...data1].map(it => it.value));

  const chartWidth = width - 20; // Sottrai eventuali padding
  const pointSpacing = chartWidth / (data.length - 1);

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
            color={hasData ? chartColors[0] : 'transparent'}
            dataPointsColor={hasData ? chartColors[0] : 'transparent'}
            color2={chartColors[1]}
            dataPointsColor2={chartColors[1]}
            dataPointsColor3={chartColors[2]}
            xAxisLabelTexts={Object.values(GradeCountGradeEnum)}
            xAxisLabelTextStyle={styles.chartAxisLabel}
            yAxisTextStyle={styles.chartAxisLabel}
            rulesColor={colors.divider}
            yAxisColor={colors.divider}
            xAxisColor={colors.divider}
            showVerticalLines
            rulesType="solid"
            spacing={pointSpacing}
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
          text={t('courseStatisticsScreen.gradesDetailLegend.otherYears')}
          trailingText={statistics?.otherYears?.averageGrade?.toString()}
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
