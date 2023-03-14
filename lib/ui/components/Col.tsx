import React, { PropsWithChildren } from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { usePropsStyle } from '../../../src/utils/theme';

type ColProps = PropsWithChildren<
  ViewProps & {
    children?: JSX.Element | JSX.Element[];
    style?: StyleProp<ViewStyle>;
    pointerEvents?: string;
    alignStart?: boolean;
    alignCenter?: boolean;
    spaceBetween?: boolean;
    justifyCenter?: boolean;
    spaceAround?: boolean;
    justifyStart?: boolean;
    alignEnd?: boolean;
    flexStart?: boolean;
    flexEnd?: boolean;
    justifyEnd?: boolean;
    flex?: number;
    backgroundColor?: string;
    onPress?: () => any;
    maxWidth?: boolean;
    onLayout?: any;
    shadow?: boolean;
    noFlex?: boolean;
    touchableOpacity?: boolean;
    width?: number;
  }
>;

export const Col = ({
  children,
  style,
  alignCenter,
  flexStart,
  justifyStart,
  noFlex,
  justifyCenter,
  justifyEnd,
  flexEnd,
  spaceBetween,
  spaceAround,
  width,
  flex,
  backgroundColor,
  maxWidth,
  ...rest
}: ColProps) => {
  const renderedStyle: Record<string, string | number> = usePropsStyle(rest);

  return (
    <View
      style={[
        renderedStyle,
        styles.row,
        maxWidth && { width: '100%' },
        flexStart && { alignItems: 'flex-start' },
        flexEnd && { alignItems: 'flex-end' },
        alignCenter && { alignItems: 'center' },
        justifyCenter && { justifyContent: 'center' },
        justifyEnd && { justifyContent: 'flex-end' },
        justifyStart && { justifyContent: 'flex-start' },
        spaceBetween && { justifyContent: 'space-between' },
        spaceAround && { justifyContent: 'space-around' },
        backgroundColor && { backgroundColor },
        noFlex && { flex: 0 },
        width && { width },
        flex && { flex },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'column',
  },
});
