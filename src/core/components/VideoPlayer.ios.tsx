import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Video, { ReactVideoProps } from 'react-native-video';

import { useNavigation } from '@react-navigation/native';

/**
 * Wraps react-native-video with custom controls for Android
 *
 * In order for fullscreen to work correctly, this component's parent should
 * be able to grow (i.e. with flex: 1)
 */
export const VideoPlayer = (props: ReactVideoProps) => {
  const { width } = useWindowDimensions();
  const { addListener } = useNavigation();
  const [paused, setPaused] = useState(false);
  const [isPiP, setIsPiP] = useState(false);

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
      ignoreSilentSwitch="ignore"
      pictureInPicture
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
