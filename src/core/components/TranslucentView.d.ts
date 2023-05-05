import { ViewProps } from 'react-native';

import { TranslucentViewProps } from './TranslucentView';

declare interface TranslucentViewProps {
  style?: ViewProps['style'];
  blurAmount?: number;
  fallbackOpacity?: number;
}

declare function TranslucentView(props: TranslucentViewProps): JSX.Element;
