import { View } from 'react-native';
import { ProgressChart as RNCKProgressChart } from 'react-native-chart-kit';

import { useTheme } from '@lib/ui/hooks/useTheme';

import color from 'color';

interface Props {
  data: number[];
  colors: string[];
}

export const ProgressChart = ({ data, colors }: Props) => {
  const { dark, colors: themeColors } = useTheme();
  return (
    <View>
      <RNCKProgressChart
        data={{
          data: [1],
        }}
        width={125}
        height={125}
        hideLegend={true}
        strokeWidth={16}
        radius={30}
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
          key={i}
          data={{
            data: [i],
          }}
          width={125}
          height={125}
          hideLegend={true}
          strokeWidth={16}
          radius={30}
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
    </View>
  );
};
