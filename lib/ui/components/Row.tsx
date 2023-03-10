import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { usePropsStyle } from '../../../src/utils/theme';

export interface RowProps {
  children?: ViewStyle | ViewStyle[] | any;
  style?: StyleProp<ViewStyle>;
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
  touchableOpacity?: boolean;
  width?: number | string;
  wrap?: boolean;
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
  touchableOpacity,
  wrap,
  ...rest
}: RowProps) => {
  const renderedStyle: Record<string, string | number> = usePropsStyle(rest);
  const Component: any = onPress
    ? touchableOpacity
      ? TouchableOpacity
      : Pressable
    : View;

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
        wrap && { flexWrap: 'wrap' },
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
