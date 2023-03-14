import { View } from 'react-native';
import { ProgressChart as RNCKProgressChart } from 'react-native-chart-kit';

import { Col } from '@lib/ui/components/Col';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import color from 'color';

import { uniformInsets } from '../../../utils/insets';

interface Props {
  data: number[];
  label?: string;
  colors: string[];
  boxSize?: number;
  thickness?: number;
  radius?: number;
}

export const ProgressChart = ({
  data,
  colors,
  label,
  boxSize = 125,
  thickness = 16,
  radius = 30,
}: Props) => {
  const { dark, colors: themeColors, fontSizes } = useTheme();

  return (
    <View>
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
            color(themeColors.primary[500])
              .alpha(dark ? 0.3 : 0.08)
              .toString(),
        }}
      />
      {data.map((i, index) => (
        <RNCKProgressChart
          key={index}
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
      ))}
      {label && (
        <Col
          justifyCenter
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
            }}
          >
            {label}
          </Text>
        </Col>
      )}
    </View>
  );
};
