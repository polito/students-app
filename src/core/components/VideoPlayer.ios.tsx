import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Video, { VideoProperties } from 'react-native-video';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useNavigation } from '@react-navigation/native';

/**
 * Wraps react-native-video with custom controls for Android
 *
 * In order for fullscreen to work correctly, this component's parent should
 * be able to grow (i.e. with flex: 1)
 */
export const VideoPlayer = (props: VideoProperties) => {
  const styles = useStylesheet(createStyles);
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
      paused={paused}
      controls={true}
      style={styles.player}
      resizeMode="contain"
      {...props}
    />
  );
};

const createStyles = () =>
  StyleSheet.create({
    player: {
      width: '100%',
      minHeight: (Dimensions.get('window').width / 16) * 9,
    },
  });
