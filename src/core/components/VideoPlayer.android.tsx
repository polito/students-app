import { useEffect, useRef, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import Video, {
  OnBufferData,
  OnLoadData,
  OnProgressData,
  VideoProperties,
} from 'react-native-video';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Col } from '@lib/ui/components/Col';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useNavigation } from '@react-navigation/native';

import { throttle } from 'lodash';

import { negate } from '../../utils/predicates';
import { displayTabBar } from '../../utils/tab-bar';
import { IS_IOS } from '../constants';
import { useFullscreenUi } from '../hooks/useFullscreenUi';
import { VideoControls } from './VideoControls';

const playbackRates = [1, 1.5, 2, 2.5];

/**
 * Wraps react-native-video with custom controls for Android
 *
 * In order for fullscreen to work correctly, this component's parent should
 * be able to grow (i.e. with flex: 1)
 */
export const VideoPlayer = (props: VideoProperties) => {
  const styles = useStylesheet(createStyles);
  const navigation = useNavigation();
  const playerRef = useRef<Video>();
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  useFullscreenUi(fullscreen);

  const handleLoad = (meta: OnLoadData) => {
    setDuration(meta.duration);
  };

  useEffect(() => {
    const navRoot = navigation.getParent();
    return () => displayTabBar(navRoot);
  }, []);

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
    <SafeAreaView style={styles.container}>
      <Video
        ref={playerRef}
        controls={false}
        paused={paused}
        style={[styles.player, fullscreen && styles.fullHeight]}
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
        fullscreen={fullscreen}
        onFullscreenPlayerDidPresent={() => setFullscreen(true)}
        onFullscreenPlayerDidDismiss={() => setFullscreen(false)}
        {...props}
      />

      {!ready && (
        <Col align="center" justify="center" style={StyleSheet.absoluteFill}>
          <ActivityIndicator size="large" />
        </Col>
      )}

      {!IS_IOS && (
        <VideoControls
          buffering={buffering}
          fullscreen={fullscreen}
          toggleFullscreen={() => {
            if (fullscreen) {
              playerRef.current?.dismissFullscreenPlayer();
            } else {
              playerRef.current?.presentFullscreenPlayer();
            }
            setFullscreen(negate);
          }}
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
      )}
    </SafeAreaView>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: {
      backgroundColor: 'black',
    },
    player: {
      width: '100%',
      minHeight: (Dimensions.get('window').width / 16) * 9,
    },
    fullHeight: {
      height: '100%',
    },
  });
