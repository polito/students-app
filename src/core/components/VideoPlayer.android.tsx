import { useEffect, useRef, useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import Video, {
  OnBufferData,
  OnLoadData,
  OnProgressData,
  VideoRef,
} from 'react-native-video';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Col } from '@lib/ui/components/Col';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme.ts';
import { useNavigation } from '@react-navigation/native';

import { throttle } from 'lodash';

import { negate } from '../../utils/predicates';
import { useFullscreenUi } from '../hooks/useFullscreenUi';
import { VideoControls } from './VideoControls';
import { VideoProps } from './VideoPlayer';

const playbackRates = [1, 1.5, 2, 2.5];

/**
 * Wraps react-native-video with custom controls for Android
 *
 * In order for fullscreen to work correctly, this component's parent should
 * have a minHeight=100% of the available window height
 */
export const VideoPlayer = (props: VideoProps) => {
  const [width, setWidth] = useState(Dimensions.get('screen').width);
  const [height, setHeight] = useState(Dimensions.get('screen').height);
  const styles = useStylesheet(createStyles);
  const playerRef = useRef<VideoRef>(null);
  // If there is a single video paused is initialized to false
  const [paused, setPaused] = useState(props.currentIndex !== props.index);
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const { addListener } = useNavigation();
  const { toggleFullScreen } = props;
  useFullscreenUi(fullscreen);

  useEffect(() => {
    return addListener('blur', () => {
      setPaused(true);
    });
  }, [addListener]);

  useEffect(() => {
    return addListener('beforeRemove', _ => {
      SystemNavigationBar.fullScreen(false);
    });
  }, [addListener]);

  useEffect(() => {
    setPaused(props.currentIndex !== props.index);
  }, [props.currentIndex, props.index]);

  useEffect(() => {
    const updateDimensions = () => {
      const { width: newWidth, height: newHeight } = Dimensions.get('screen');
      setWidth(newWidth);
      setHeight(newHeight);
    };
    Dimensions.addEventListener('change', updateDimensions);
  }, []);

  useEffect(() => {
    if (fullscreen) {
      SystemNavigationBar.stickyImmersive();
      StatusBar.setHidden(true);
    } else {
      SystemNavigationBar.fullScreen(fullscreen);
    }
    toggleFullScreen?.(fullscreen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen]);

  const handleLoad = (meta: OnLoadData) => {
    setDuration(meta.duration);
  };

  const togglePlaybackRate = () => {
    const actualRateIndex = playbackRates.findIndex(
      rate => rate === playbackRate,
    );
    const newIndex = (actualRateIndex + 1) % 4;
    setPlaybackRate(playbackRates[newIndex]);
  };

  const onProgressChange = throttle((newProgress: number) => {
    try {
      const newSeekValue = newProgress * duration;
      if (playerRef && playerRef.current) {
        playerRef.current.seek(newSeekValue);
      }
      setProgress(newProgress);
    } catch (e) {
      console.debug('Cannot seek video', e);
    }
  }, 200);

  const handleProgress = (videoProgress: OnProgressData) => {
    const p = videoProgress.currentTime / duration;
    if (p === Infinity || isNaN(p)) {
      return;
    }
    setProgress(p);
  };

  // noinspection JSSuspiciousNameCombination
  return (
    <SafeAreaView
      style={[
        styles.container,
        fullscreen && {
          position: 'absolute',
          width,
          height,
          zIndex: 1,
        },
      ]}
    >
      <Video
        ref={playerRef}
        controls={false}
        paused={paused}
        style={
          !fullscreen
            ? {
                width: '100%',
                minHeight: (width / 16) * 9,
              }
            : styles.fullHeight
        }
        rate={playbackRate}
        resizeMode="contain"
        onLoad={handleLoad}
        onReadyForDisplay={() => setReady(true)}
        onProgress={handleProgress}
        onEnd={() => {
          setPaused(true);
          onProgressChange(0);
        }}
        onBuffer={(data: OnBufferData) => setBuffering(data.isBuffering)}
        fullscreen={false}
        {...props}
      />
      {ready ? (
        <VideoControls
          buffering={buffering}
          fullscreen={fullscreen}
          toggleFullscreen={() => setFullscreen(negate)}
          progress={progress}
          onProgressChange={onProgressChange}
          paused={paused}
          togglePaused={(_paused?: boolean) =>
            setPaused(old => (_paused === undefined ? !old : _paused))
          }
          duration={duration}
          playbackRate={playbackRate}
          setPlaybackRate={togglePlaybackRate}
        />
      ) : (
        <Col align="center" justify="center" style={StyleSheet.absoluteFill}>
          <ActivityIndicator size="large" />
        </Col>
      )}
    </SafeAreaView>
  );
};

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.black,
    },
    fullHeight: {
      height: '100%',
    },
  });
