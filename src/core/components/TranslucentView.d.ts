import { ViewStyle } from 'react-native';

import { TranslucentViewProps } from './TranslucentView';

declare interface TranslucentViewProps {
  style?: ViewStyle;
  blurAmount?: number;
  fallbackOpacity?: number;
}

declare function TranslucentView(props: TranslucentViewProps): JSX.Element;
