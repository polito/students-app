import { StyleSheet, View } from 'react-native';

import { Row } from '@lib/ui/components/Row.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import type { Theme } from '@lib/ui/types/Theme.ts';

export const LegendItem = ({
  bulletColor,
  text,
  trailingText,
}: {
  bulletColor: string;
  text: string;
  trailingText?: string;
}) => {
  const styles = useStylesheet(createStyles);
  return (
    <Row gap={2} style={{ alignItems: 'center' }}>
      <View
        style={{
          ...styles.chartLegendBullet,
          backgroundColor: bulletColor,
        }}
      />
      <Text
        variant="prose"
        style={styles.chartLegendText}
        accessibilityLabel={text}
      >
        {text}
      </Text>
      {trailingText && (
        <Text
          variant="prose"
          style={styles.chartLegendTrailingText}
          accessibilityLabel={trailingText}
        >
          {trailingText}
        </Text>
      )}
    </Row>
  );
};

const createStyles = ({ fontSizes, fontWeights }: Theme) =>
  StyleSheet.create({
    chartLegendBullet: {
      height: 8,
      width: 8,
      borderRadius: 8,
    },
    chartLegendText: {
      fontSize: fontSizes.xs,
    },
    chartLegendTrailingText: {
      marginLeft: 'auto',
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
  });
