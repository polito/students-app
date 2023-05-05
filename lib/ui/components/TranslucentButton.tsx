import { Platform, StyleSheet, TouchableHighlight, View } from 'react-native';

import { Row, RowProps } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { TranslucentView } from '../../../src/core/components/TranslucentView';

export const TranslucentButton = ({ children, ...props }: RowProps) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);

  return (
    <TouchableHighlight underlayColor={colors.touchableHighlight}>
      <View style={styles.container}>
        <TranslucentView />
        <Row ph={4} pv={3} align="center" {...props}>
          {children}
        </Row>
      </View>
    </TouchableHighlight>
  );
};

const createStyles = ({ shapes }: Theme) =>
  StyleSheet.create({
    container: {
      borderRadius: Platform.select({ android: 60, ios: shapes.lg }),
      overflow: 'hidden',
    },
  });
