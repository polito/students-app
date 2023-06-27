import { StyleSheet, View } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { isNumber } from 'lodash';

import { formatHour } from '../../utils/calendar';

interface HourGuideColumnProps {
  cellHeight: number;
  hour?: string | number;
  ampm: boolean;
}

export const HourGuideColumn = ({
  cellHeight,
  hour,
  ampm,
}: HourGuideColumnProps) => {
  const styles = useStylesheet(createStyles);

  return (
    <View style={{ height: cellHeight, width: 35 }}>
      <Text style={styles.hourLabel}>
        {isNumber(hour) ? formatHour(hour, ampm) : hour}
      </Text>
    </View>
  );
};

const createStyles = ({ palettes, fontSizes }: Theme) =>
  StyleSheet.create({
    hourLabel: {
      textAlign: 'center',
      position: 'absolute',
      top: -8,
      width: '100%',
      color: palettes.gray[500],
      fontSize: fontSizes.xs,
    },
  });
