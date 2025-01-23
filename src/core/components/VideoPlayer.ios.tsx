import { useEffect, useState } from 'react';
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

  useEffect(() => {
    return addListener('blur', () => {
      setPaused(false);
      setTimeout(() => {
        setPaused(true);
      });
    });
  }, []);

  return (
    <Video
      ignoreSilentSwitch="ignore"
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
