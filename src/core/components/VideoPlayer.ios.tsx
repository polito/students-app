import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Video from 'react-native-video';

import { useNavigation } from '@react-navigation/native';

import { VideoProps } from './VideoPlayer';

/**
 * Wraps react-native-video with custom controls for Android
 *
 * In order for fullscreen to work correctly, this component's parent should
 * be able to grow (i.e. with flex: 1)
 */
export const VideoPlayer = (props: VideoProps) => {
  const { width } = useWindowDimensions();
  const { addListener } = useNavigation();
  // If there is a single video paused is initialized to false
  const [paused, setPaused] = useState(props.currentIndex !== props.index);
  const [isPiP, setIsPiP] = useState(false);

  const { index, currentIndex } = props;

  useEffect(() => {
    setPaused(currentIndex !== index);
  }, [index, currentIndex]);

  useEffect(() => {
    return addListener('blur', () => {
      if (isPiP) return;
      setPaused(false);
      setTimeout(() => {
        setPaused(true);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPiP]);

  const onPictureInPictureStatusChanged = useCallback(
    ({ isActive }: { isActive: boolean }) => {
      setIsPiP(isActive);
    },
    [],
  );

  return (
    <Video
      onPictureInPictureStatusChanged={onPictureInPictureStatusChanged}
      playInBackground={index === currentIndex}
      ignoreSilentSwitch="ignore"
      enterPictureInPictureOnLeave={index === currentIndex}
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
