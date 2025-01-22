import { useEffect, useRef, useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import Video, {
  OnBufferData,
  OnLoadData,
  OnProgressData,
  ReactVideoProps,
  VideoRef,
} from 'react-native-video';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Col } from '@lib/ui/components/Col';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useNavigation } from '@react-navigation/native';

import { throttle } from 'lodash';

import { negate } from '../../utils/predicates';
import { displayTabBar } from '../../utils/tab-bar';
import { useFullscreenUi } from '../hooks/useFullscreenUi';
import { VideoControls } from './VideoControls';

const playbackRates = [1, 1.5, 2, 2.5];

/**
 * Wraps react-native-video with custom controls for Android
 *
 * In order for fullscreen to work correctly, this component's parent should
 * have a minHeight=100% of the available window height
 */
export const VideoPlayer = (props: ReactVideoProps) => {
  const [width, setWidth] = useState(Dimensions.get('screen').width);
  const [height, setHeight] = useState(Dimensions.get('screen').height);
  const styles = useStylesheet(createStyles);
  const navigation = useNavigation();
  const playerRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  useFullscreenUi(fullscreen);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', _ => {
      SystemNavigationBar.fullScreen(false);
    });

    return unsubscribe;
  }, [navigation]);

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
  }, [fullscreen]);

  const handleLoad = (meta: OnLoadData) => {
    setDuration(meta.duration);
  };

  useEffect(() => {
    const navRoot = navigation.getParent()!;
    return () => displayTabBar(navRoot);
  }, [navigation]);

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

const createStyles = () =>
  StyleSheet.create({
    // eslint-disable-next-line react-native/no-color-literals
    container: {
      backgroundColor: 'black',
    },
    fullHeight: {
      height: '100%',
    },
  });
