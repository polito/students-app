import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { usePropsStyle } from '../../../src/utils/theme';

export interface ColProps {
  children?: JSX.Element | JSX.Element[];
  style?: StyleProp<ViewStyle>;
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
  maxWidth?: boolean;
  onLayout?: any;
  shadow?: boolean;
  noFlex?: boolean;
  width?: number;
}

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
