import { ReactVideoProps } from 'react-native-video';

export type VideoProps = {
  toggleFullScreen?: () => void;
} & ReactVideoProps;
declare function VideoPlayer(props: VideoProps): JSX.Element;
