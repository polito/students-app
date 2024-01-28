import * as Svg from 'react-native-svg';
import { SvgProps } from 'react-native-svg/src/elements/Svg';

export const VerticalDashedLine = ({
  height,
  width,
  color,
  style,
  ...rest
}: SvgProps) => {
  return (
    <Svg.Svg
      height={height}
      width={width}
      style={[style, { alignSelf: 'center' }]}
      {...rest}
    >
      <Svg.Line
        stroke={color}
        strokeWidth={width}
        strokeDasharray="9, 14"
        x1="0"
        y1="0"
        x2="0"
        y2={height}
      />
    </Svg.Svg>
  );
};
