import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';

import { VideoControl } from '@lib/ui/components/VideoControl';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../src/utils/conts';

type videoProps = {
  videoUrl: string;
  coverUrl: string;
  onHideFullScreen: (newProgress: number) => void;
  duration: number;
  progress: number;
  playbackRate: number;
  setPlaybackRate: () => void;
  handleProgress: (data: any) => void;
};

export const VideoPlayerFullScreen = ({
  videoUrl,
  coverUrl,
  onHideFullScreen,
  duration,
  progress,
  playbackRate,
  handleProgress,
  setPlaybackRate,
}: videoProps) => {
  const playerRef = useRef<Video>();
  const styles = useStylesheet(createStyles);
  const [paused, setPaused] = useState(false);

  const handleLoad = () => {
    onSeekEnd(progress * 100);
  };

  const onSeekEnd = useCallback(
    (newProgress: number) => {
      try {
        const newSeekValue = (newProgress * duration) / 100;
        if (playerRef && playerRef.current) {
          playerRef.current.seek(newSeekValue, 0.5);
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

  console.log({ progress });
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
        muted={false}
        fullscreen={true}
      />
      <VideoControl
        toggleFullscreen={() => onHideFullScreen(progress)}
        onRelease={onSeekEnd}
        newPosition={progress}
        paused={paused}
        togglePaused={togglePaused}
        isLandscape={true}
        secondsDuration={duration}
        setPlaybackRate={setPlaybackRate}
        playbackRate={playbackRate}
      />
    </>
  );
};

const createStyles = () =>
  StyleSheet.create({
    landscapeView: {
      width: SCREEN_HEIGHT,
      height: SCREEN_WIDTH,
      backgroundColor: 'black',
      position: 'absolute',
    },
  });
