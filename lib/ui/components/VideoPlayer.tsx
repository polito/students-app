import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Video from 'react-native-video';

import { Tab } from '@lib/ui/components/Tab';
import { Text } from '@lib/ui/components/Text';
import { VideoControl } from '@lib/ui/components/VideoControl';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { useHandleFullscreen } from '../../../src/core/hooks/useHandleFullscreen';
import { useVideoControls } from '../../../src/core/hooks/useVideoControls';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../src/utils/const';

const isIos = Platform.OS === 'ios';

export interface VideoPlayerProps {
  videoUrl: string;
  coverUrl: string;
}

export const VideoPlayer = ({ videoUrl, coverUrl }: VideoPlayerProps) => {
  const width = useMemo(() => Dimensions.get('window').width, []);
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const {
    fullscreen,
    togglePaused,
    toggleFullscreen,
    toggleMuted,
    muted,
    ready,
    paused,
    handleLoad,
    duration,
    onReadyForDisplay,
  } = useVideoControls();
  useHandleFullscreen(fullscreen);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const playerRef = useRef<Video>();

  // console.debug({ready})

  const source = useMemo(() => {
    return {
      uri: videoUrl,
    };
  }, []);

  const playerStyle = useMemo(() => {
    return [
      {
        height: (width / 16) * 9,
      },
      fullscreen &&
        !isIos && {
          ...styles.landscapeView,
          height: SCREEN_WIDTH,
        },
    ];
  }, [fullscreen, isIos]);

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

  const onRelease = useCallback(
    (newProgress: number) => {
      try {
        const newSeekValue = (newProgress * duration) / 100;
        console.debug({ newProgress, newSeekValue, duration });
        if (playerRef && playerRef.current) {
          playerRef.current.seek(newSeekValue, 50);
        }
      } catch (e) {
        console.debug('errorSeek', e);
      }
    },
    [playerRef, duration],
  );

  const handleProgress = useCallback(
    (videoProgress: any) => {
      try {
        const p = videoProgress.currentTime / duration;
        if (p === Infinity || isNaN(p)) {
          return;
        }
        setProgress(p);
      } catch (e) {
        console.debug('errorHandleProgress', e);
      }
    },
    [duration],
  );

  return (
    <View>
      {!ready && (
        <View style={[playerStyle, styles.loader]}>
          <ActivityIndicator />
        </View>
      )}
      <Video
        ref={playerRef}
        controls={isIos}
        paused={paused}
        style={playerStyle}
        source={source}
        poster={coverUrl}
        rate={playbackRate}
        resizeMode="contain"
        onLoad={handleLoad}
        onProgress={handleProgress}
        muted={muted}
        onReadyForDisplay={onReadyForDisplay}
        fullscreen={isIos ? fullscreen : false}
        onFullscreenPlayerDidDismiss={toggleFullscreen}
      />
      {!isIos && (
        <VideoControl
          toggleFullscreen={toggleFullscreen}
          onRelease={onRelease}
          progress={progress}
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
    loader: {
      position: 'absolute',
      top: 0,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      zIndex: 99,
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
