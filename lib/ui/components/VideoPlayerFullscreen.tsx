import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';

import { VideoControl } from '@lib/ui/components/VideoControl';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../src/utils/conts';

type videoProps = {
  videoUrl: string;
  coverUrl: string;
  onHideFullScreen: () => void;
};

export const VideoPlayerFullScreen = ({
  videoUrl,
  coverUrl,
  onHideFullScreen,
}: videoProps) => {
  // console.log({ videoUrl, coverUrl });
  const playerRef = useRef();
  const styles = useStylesheet(createStyles);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const isLandscape = true;

  useEffect(() => {
    // Dimensions.set({
    //   // ...Dimensions.get('window'),
    //   width: Dimensions.get('window').height,
    //   height: Dimensions.get('window').width
    // })
  }, []);

  const onSeekEnd = useCallback(
    (newProgress: number) => {
      try {
        const newSeekValue = (newProgress * duration) / 100;
        console.log({ newSeekValue });
        console.log('onSeekEnd', { newSeekValue, duration, newProgress });
        if (playerRef && playerRef.current) {
          // @ts-ignore
          playerRef.current.seek(newSeekValue);
        }
      } catch (e) {
        console.log('errorSeek', e);
      }
    },
    [playerRef, duration],
  );

  const togglePaused = useCallback(() => {
    setPaused(prev => !prev);
  }, [playerRef]);

  const toggleMuted = useCallback(() => {
    setMuted(prev => !prev);
  }, [playerRef]);

  const handleLoad = useCallback((meta: any) => {
    console.log('meta', meta);
    setDuration(meta.duration);
  }, []);

  const handleProgress = useCallback(
    (videoProgress: any) => {
      try {
        if (loading) {
          setLoading(false);
        }
        const p = videoProgress.currentTime / duration;
        if (p === Infinity || isNaN(p)) {
          return;
        } else {
          setProgress(p);
        }
      } catch (e) {
        console.log('errorHandleProgress', e);
      }
    },
    [duration, loading],
  );

  return (
    <>
      <Video
        ref={playerRef}
        controls={false}
        paused={paused}
        source={{
          uri: videoUrl,
        }}
        style={styles.landscapeView}
        poster={coverUrl}
        rate={playbackRate}
        resizeMode="contain"
        onLoad={handleLoad}
        onProgress={handleProgress}
        muted={true}
        fullscreen={true}
      />
      {/* <View style={styles.videoControlOverlay}> */}
      <VideoControl
        toggleFullscreen={onHideFullScreen}
        onRelease={onSeekEnd}
        newPosition={progress}
        paused={paused}
        togglePaused={togglePaused}
        toggleMuted={toggleMuted}
        muted={muted}
        isLandscape={true}
        secondsDuration={duration}
      />
      {/* </View> */}
    </>
  );
};

const createStyles = ({ spacing, size }: Theme) =>
  StyleSheet.create({
    videoControlOverlay: {
      // transform: [{ rotate: '-90deg' }],
      // left: -SCREEN_HEIGHT / 2 + SCREEN_WIDTH / 2,
    },
    landscapeView: {
      width: SCREEN_HEIGHT,
      height: SCREEN_WIDTH,
      backgroundColor: 'black',
      // transform: [{ rotate: '270deg' }],
      position: 'absolute',
      // left: -SCREEN_HEIGHT / 2 + SCREEN_WIDTH / 2,
      // top: SCREEN_WIDTH / 2 + 35,
      // top: 0,
      // bottom: 0
    },
    container: {
      // top: 60
      marginTop: 50,
    },
    speedSection: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    speedTabsContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    speedTab: {
      width: 55,
      marginLeft: spacing[2],
    },
  });
