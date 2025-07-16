import { VideoProperties } from 'react-native-video';

export type VideoProps = {
  toggleFullScreen?: (value: boolean) => void;
  currentIndex?: number;
  index?: number;
} & VideoProperties;

declare function VideoPlayer(props: VideoProps): JSX.Element;
