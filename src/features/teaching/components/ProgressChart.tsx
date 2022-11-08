import { ProgressChart as RNCKProgressChart } from 'react-native-chart-kit';

import color from 'color';

interface Props {
  data: number[];
  colors: string[];
}

export const ProgressChart = ({ data, colors }: Props) => {
  return (
    <RNCKProgressChart
      data={{
        data,
      }}
      width={125}
      height={125}
      hideLegend={true}
      strokeWidth={12}
      radius={22}
      style={{
        margin: -20,
      }}
      chartConfig={{
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1, index = 0) =>
          color(colors[index]).alpha(opacity).toString(),
      }}
    />
  );
};
