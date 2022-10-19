import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { usePropsStyle } from '../../../src/utils/theme';

export interface RowProps {
  children?: ViewStyle | ViewStyle[] | any;
  style?: { [key: string]: any };
  pointerEvents?: string;
  alignStart?: boolean;
  alignCenter?: boolean;
  spaceBetween?: boolean;
  justifyCenter?: boolean;
  spaceAround?: boolean;
  justifyStart?: boolean;
  alignEnd?: boolean;
  justifyEnd?: boolean;
  backgroundColor?: string;
  onPress?: () => any;
  maxWidth?: boolean;
  onLayout?: any;
  noFlex?: boolean;
  width?: number | string;
}

export const Row = ({
  children,
  style,
  pointerEvents = null,
  alignStart,
  onLayout,
  noFlex,
  alignCenter,
  spaceBetween,
  width,
  justifyCenter,
  spaceAround,
  justifyStart,
  alignEnd,
  justifyEnd,
  onPress,
  backgroundColor,
  maxWidth,
  ...rest
}: RowProps) => {
  const renderedStyle: { [key: string]: any } = usePropsStyle(rest);
  const Component: any = onPress ? Pressable : View;

  return (
    <Component
      style={[
        renderedStyle,
        styles.row,
        noFlex && { flex: 0 },
        maxWidth && { width: '100%' },
        alignCenter && { alignItems: 'center' },
        alignStart && { alignItems: 'flex-start' },
        alignEnd && { alignItems: 'flex-end' },
        justifyCenter && { justifyContent: 'center' },
        justifyStart && { justifyContent: 'flex-start' },
        justifyEnd && { justifyContent: 'flex-end' },
        spaceBetween && { justifyContent: 'space-between' },
        spaceAround && { justifyContent: 'space-around' },
        backgroundColor && { backgroundColor },
        width && { width },
        style,
      ]}
      pointerEvents={pointerEvents}
      collapsable={false}
      onLayout={onLayout}
      onPress={onPress}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});
