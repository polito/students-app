import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
  console.log({ videoUrl, coverUrl });
  const playerRef = useRef();
  const styles = useStylesheet(createStyles);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  const onSeekEnd = useCallback(
    (newProgress: number) => {
      try {
        const newSeekValue = newProgress * 5447;
        // console.log({duration});
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
    <View style={[styles.container]}>
      <Video
        ref={playerRef}
        controls={false}
        paused={paused}
        source={{
          uri: videoUrl,
        }}
        style={{
          height: SCREEN_HEIGHT,
          width: SCREEN_WIDTH,
          position: 'absolute',
          right: 0,
          transform: [{ rotate: '-90deg' }],
        }}
        poster={coverUrl}
        rate={playbackRate}
        resizeMode="contain"
        onLoad={handleLoad}
        onProgress={handleProgress}
        muted={true}
        fullscreen={true}
      />
      <VideoControl
        toggleFullscreen={onHideFullScreen}
        onRelease={onSeekEnd}
        newPosition={progress}
        paused={paused}
        togglePaused={togglePaused}
        toggleMuted={toggleMuted}
        muted={muted}
        rotate={true}
        secondsDuration={duration}
      />
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    videoHorizontal: {
      // width: SCREEN_HEIGHT,
      // height: SCREEN_WIDTH,
      // backgroundColor: 'red',
      transform: [{ rotate: '90deg' }],
      position: 'absolute',
      // bottom: 0,
      // right:0
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
