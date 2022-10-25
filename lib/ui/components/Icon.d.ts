import { FunctionComponent } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  ios: string;
  android: string;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

declare const Icon: FunctionComponent<IconProps>;
