import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { usePropsStyle } from '../../utils/theme';

export interface ColProps {
  children?: ViewStyle;
  style?: { [key: string]: any };
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
  onPress: () => any;
  maxWidth?: number;
  onLayout?: any;
  shadow?: boolean;
  noFlex?: boolean;
  width?: number;
}

export const Col = ({
  children,
  style,
  pointerEvents = null,
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
  onPress,
  backgroundColor,
  maxWidth,
  ...rest
}: ColProps) => {
  const renderedStyle: { [key: string]: any } = usePropsStyle(rest);
  const Component: any = onPress ? Pressable : View;

  return (
    <Component
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
      pointerEvents={pointerEvents}
      onPress={onPress}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
});
