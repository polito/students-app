import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';

import { Tab } from '@lib/ui/components/Tab';
import { Text } from '@lib/ui/components/Text';
import { VideoControl } from '@lib/ui/components/VideoControl';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { useNavigation } from '@react-navigation/native';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../src/utils/const';
import { displayTabBar, hideTabBar } from '../../../src/utils/tab-bar';

const isIos = Platform.OS === 'ios';

export interface VideoPlayerProps {
  videoUrl: string;
  coverUrl: string;
}

export const VideoPlayer = ({ videoUrl, coverUrl }: VideoPlayerProps) => {
  const width = useMemo(() => Dimensions.get('window').width, []);
  const statusBarHeight = useMemo(() => StatusBar.currentHeight, []);
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const playerRef = useRef<Video>();
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const navigation = useNavigation();
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const navRoot = navigation.getParent();
    return () => displayTabBar(navRoot);
  }, []);

  useEffect(() => {
    const navRoot = navigation.getParent();
    if (!isIos) {
      if (fullscreen) {
        Orientation.lockToLandscapeLeft();
        navigation.setOptions({
          headerShown: false,
        });
        hideTabBar(navRoot);
        setTimeout(() => {
          Orientation.lockToLandscapeLeft();
        }, 10);
      } else {
        navigation.setOptions({
          headerShown: true,
        });
        displayTabBar(navRoot);
        setTimeout(() => {
          Orientation.lockToPortrait();
        }, 10);
      }
    }
  }, [fullscreen]);

  const speedControls = useMemo(() => {
    if (!isIos || parseInt(Platform.Version as string, 10) >= 16) return; // Speed controls are included in native player since iOS 16

    return (
      <View style={styles.speedSection}>
        <Text variant="headline">{t('videoPlayer.speedSectionTitle')}:</Text>
        <View style={styles.speedTabsContainer}>
          {[1, 1.5, 2, 2.5].map(rate => (
            <Tab
              key={rate}
              onPress={() => setPlaybackRate(rate)}
              textStyle={{ textAlign: 'center' }}
              style={styles.speedTab}
              selected={playbackRate === rate}
            >
              {rate}x
            </Tab>
          ))}
        </View>
      </View>
    );
  }, [playbackRate]);

  const togglePlaybackRate = () => {
    const rates = [1, 1.5, 2, 2.5];
    const actualRateIndex = rates.findIndex(rate => rate === playbackRate);
    const newIndex = actualRateIndex === 3 ? 0 : actualRateIndex + 1;
    setPlaybackRate(rates[newIndex]);
  };

  const onSeekEnd = useCallback(
    (newProgress: number) => {
      console.debug({ newProgress });
      try {
        const newSeekValue = (newProgress * duration) / 100;
        if (playerRef && playerRef.current) {
          playerRef.current.seek(newSeekValue);
        }
      } catch (e) {
        console.debug('errorSeek', e);
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

  const toggleFullscreen = useCallback(() => {
    setFullscreen(prev => !prev);
  }, [playerRef]);

  const handleLoad = useCallback((meta: any) => {
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
        }
        setProgress(p);
      } catch (e) {
        console.debug('errorHandleProgress', e);
      }
    },
    [duration, loading],
  );

  return (
    <View>
      <Video
        ref={playerRef}
        controls={isIos}
        paused={paused}
        style={[
          {
            height: (width / 16) * 9,
          },
          fullscreen &&
            !isIos && {
              ...styles.landscapeView,
              height: SCREEN_WIDTH - statusBarHeight + 1,
            },
        ]}
        source={{
          uri: videoUrl,
        }}
        poster={coverUrl}
        rate={playbackRate}
        resizeMode="contain"
        onLoad={handleLoad}
        onProgress={handleProgress}
        muted={muted}
        fullscreen={isIos ? fullscreen : false}
        onFullscreenPlayerDidDismiss={toggleFullscreen}
      />
      {!isIos && (
        <VideoControl
          toggleFullscreen={toggleFullscreen}
          onRelease={onSeekEnd}
          newPosition={progress}
          paused={paused}
          togglePaused={togglePaused}
          toggleMuted={toggleMuted}
          muted={muted}
          isLandscape={fullscreen}
          secondsDuration={duration}
          playbackRate={playbackRate}
          setPlaybackRate={togglePlaybackRate}
        />
      )}
      {speedControls}
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    speedSection: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    landscapeView: {
      width: SCREEN_HEIGHT,
      height: SCREEN_WIDTH - 29,
      backgroundColor: 'black',
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
