import * as React from 'react';
import { Text, TextStyle, View } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { formatHour } from '../../utils/calendar';
import { objHasContent } from '../../utils/object';

interface HourGuideColumnProps {
  cellHeight: number;
  hour: number;
  ampm: boolean;
  hourStyle: TextStyle;
}

const _HourGuideColumn = ({
  cellHeight,
  hour,
  ampm,
  hourStyle = {},
}: HourGuideColumnProps) => {
  const theme = useTheme();
  const textStyle = React.useMemo(
    () => ({
      color: theme.palettes.gray[500],
      fontSize: theme.fontSizes.xs,
    }),
    [theme],
  );

  return (
    <View style={{ height: cellHeight }}>
      <Text
        style={[
          objHasContent(hourStyle) ? hourStyle : textStyle,
          { textAlign: 'center' },
        ]}
      >
        {formatHour(hour, ampm)}
      </Text>
    </View>
  );
};

export const HourGuideColumn = React.memo(_HourGuideColumn, () => true);
