import { StyleSheet, View } from 'react-native';

import { Col, ColProps } from '@lib/ui/components/Col';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { lightTheme } from '../../../src/core/themes/light';
import { ThemeContext } from '../contexts/ThemeContext';

export type CalloutProps = ColProps;

export const Callout = ({ children, style, ...props }: CalloutProps) => {
  const styles = useStylesheet(createStyles);

  return (
    <ThemeContext.Provider value={lightTheme}>
      <Col {...props} style={[styles.container, style]}>
        {children}
        <View style={styles.arrow} />
      </Col>
    </ThemeContext.Provider>
  );
};

const createStyles = ({ colors, shapes }: Theme) =>
  StyleSheet.create({
    container: {
      maxWidth: 300,
      maxHeight: 200,
      backgroundColor: 'white',
      borderRadius: shapes.md,
      borderColor: colors.divider,
      borderWidth: 1,
      shadowColor: 'black',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      marginBottom: 6,
    },
    arrow: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: -6,
      width: 10,
      height: 10,
      backgroundColor: 'white',
      borderColor: colors.divider,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderBottomRightRadius: 2,
      transform: [
        {
          rotateZ: '45deg',
        },
      ],
    },
  });
