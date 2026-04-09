import { useTranslation } from 'react-i18next';
import { View, ViewProps } from 'react-native';
import { ProgressChart as RNCKProgressChart } from 'react-native-chart-kit';

import { Col } from '@lib/ui/components/Col';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import color from 'color';

import { usePreferencesContext } from '../../../../src/core/contexts/PreferencesContext';
import { uniformInsets } from '../../../utils/insets';

type Props = ViewProps & {
  data: number[];
  label?: string;
  colors: string[];
  boxSize?: number;
  thickness?: number;
  radius?: number;
};

export const ProgressChart = ({
  data,
  colors,
  label,
  boxSize = 125,
  thickness = 16,
  radius = 30,
  ...rest
}: Props) => {
  const { dark, colors: themeColors, palettes, fontSizes } = useTheme();
  const { accessibility } = usePreferencesContext();
  const { t } = useTranslation();

  // Create accessibility label and value for the chart
  const accessibilityLabel = label
    ? label.replace('\n', ' ')
    : t('common.progressChart');

  const finalAccessibilityLabel =
    data.length > 1
      ? t('common.progressChartMulti', {
          first: data[0],
          last: data.at(-1),
        })
      : accessibilityLabel;

  const accessibilityValue =
    data.length > 0
      ? {
          min: 0,
          max: 1,
          now: data.at(-1) || 0,
        }
      : undefined;

  return (
    <View
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={finalAccessibilityLabel}
      accessibilityValue={accessibilityValue}
      focusable={true}
      {...rest}
    >
      <View importantForAccessibility="no-hide-descendants">
        <RNCKProgressChart
          data={{
            data: [1],
          }}
          width={boxSize}
          height={boxSize}
          hideLegend={true}
          strokeWidth={thickness}
          radius={radius}
          style={{
            margin: -20,
          }}
          chartConfig={{
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            color: () =>
              color(palettes.primary[500])
                .alpha(dark ? 0.3 : 0.08)
                .toString(),
          }}
        />
      </View>
      {data.map((i, index) => (
        <View
          key={`progress-wrapper-${i}-${index}`}
          importantForAccessibility="no-hide-descendants"
        >
          <RNCKProgressChart
            key={`progress-${i}-${index}`}
            data={{
              data: [i],
            }}
            width={boxSize}
            height={boxSize}
            hideLegend={true}
            strokeWidth={thickness}
            radius={radius}
            style={{
              margin: -20,
              position: 'absolute',
            }}
            chartConfig={{
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              color: (opacity = 1) =>
                color(colors[index]).alpha(Math.round(opacity)).toString(),
            }}
          />
        </View>
      ))}
      {label && (
        <Col
          align="center"
          justify="center"
          style={{
            position: 'absolute',
            ...uniformInsets(0),
          }}
        >
          <Text
            style={{
              fontSize: fontSizes.xs,
              color: themeColors.secondaryText,
              textAlign: 'center',
              fontWeight:
                accessibility?.fontSize && accessibility.fontSize >= 150
                  ? '600'
                  : undefined,
            }}
          >
            {label}
          </Text>
        </Col>
      )}
    </View>
  );
};
