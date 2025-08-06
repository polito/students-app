import { ReactVideoProps } from 'react-native-video';

export type VideoProps = {
  toggleFullScreen?: (value: boolean) => void;
  currentIndex?: number;
  index?: number;
} & ReactVideoProps;

declare function VideoPlayer(props: VideoProps): JSX.Element;
