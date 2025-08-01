import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Video, { ReactVideoProps } from 'react-native-video';

import { useNavigation } from '@react-navigation/native';

type VideoProps = {
  toggleFullScreen?: (value: boolean) => void;
  currentIndex?: number;
  index?: number;
} & ReactVideoProps;

/**
 * Wraps react-native-video with support to multiple videos
 *
 */
export const VideoPlayer = ({ currentIndex, index, ...props }: VideoProps) => {
  const { width } = useWindowDimensions();
  const { addListener } = useNavigation();
  // If there is a single video paused is initialized to false
  const [paused, setPaused] = useState(currentIndex !== index);
  // const [isPiP, setIsPiP] = useState(false);

  useEffect(() => {
    setPaused(currentIndex !== index);
  }, [index, currentIndex]);

  useEffect(() => {
    return addListener('blur', () => {
      // if (isPiP) return;
      setPaused(false);
      setTimeout(() => {
        setPaused(true);
      });
    });
  }, [addListener, setPaused]);

  /* const onPictureInPictureStatusChanged = useCallback(
    ({ isActive }: { isActive: boolean }) => {
      // setIsPiP(isActive);
    },
    [],
  ); */

  return (
    <Video
      // onPictureInPictureStatusChanged={onPictureInPictureStatusChanged}
      // playInBackground={IS_IOS && index === currentIndex}
      playInBackground={false}
      ignoreSilentSwitch="ignore"
      // enterPictureInPictureOnLeave={IS_IOS && index === currentIndex}
      enterPictureInPictureOnLeave={false}
      paused={paused}
      controls={true}
      style={{
        width: '100%',
        minHeight: (width / 16) * 9,
      }}
      resizeMode="contain"
      {...props}
    />
  );
};
