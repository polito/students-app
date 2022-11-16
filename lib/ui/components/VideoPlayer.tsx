import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Modal, Platform, StyleSheet, View } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';

import { Tab } from '@lib/ui/components/Tab';
import { Text } from '@lib/ui/components/Text';
import { VideoControl } from '@lib/ui/components/VideoControl';
import { VideoPlayerFullScreen } from '@lib/ui/components/VideoPlayerFullscreen';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { isIos } from '../../../src/utils';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../src/utils/conts';

export interface VideoPlayerProps {
  videoUrl: string;
  coverUrl: string;
  onOpenFullScreen?: (params: { videoUrl: string; coverUrl: string }) => void;
}

export const VideoPlayer = ({
  videoUrl,
  coverUrl,
  onOpenFullScreen,
}: VideoPlayerProps) => {
  const width = useMemo(() => Dimensions.get('window').width, []);
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const playerRef = useRef();
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // const [horizontal, setHorizontal] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const speedControls = useMemo(() => {
    if (parseInt(Platform.Version as string, 10) >= 16) return; // Speed controls are included in native player since iOS 16

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

  const onSeekEnd = useCallback(
    (newProgress: number) => {
      try {
        const newSeekValue = (newProgress * duration) / 100;
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

  const toggleFullscreen = useCallback(() => {
    console.log('hide');
    if (!isIos) {
      console.log(modalVisible);
      if (modalVisible) {
        Orientation.lockToPortrait();
        setModalVisible(false);
      } else {
        Orientation.lockToLandscapeLeft();
        setModalVisible(true);
      }
    } else {
      setFullscreen(prev => !prev);
    }
  }, [playerRef, modalVisible]);

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
    <View>
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          supportedOrientations={['portrait']}
          onOrientationChange={or => {
            console.log('onOrientationChange', or);
          }}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View
            style={{
              height: SCREEN_HEIGHT,
              width: SCREEN_WIDTH,
              backgroundColor: 'black',
            }}
          >
            <VideoPlayerFullScreen
              videoUrl={videoUrl}
              coverUrl={coverUrl}
              onHideFullScreen={toggleFullscreen}
            />
          </View>
        </Modal>
      )}
      <Video
        ref={playerRef}
        controls={false}
        paused={paused}
        style={{
          height: (width / 16) * 9,
        }}
        source={{
          uri: videoUrl,
        }}
        poster={coverUrl}
        rate={playbackRate}
        resizeMode="contain"
        onLoad={handleLoad}
        onProgress={handleProgress}
        muted={true}
        fullscreen={fullscreen}
        onFullscreenPlayerDidDismiss={toggleFullscreen}
      />
      {!isIos && (
        <VideoControl
          toggleFullscreen={toggleFullscreen}
          fullscreen={fullscreen}
          onRelease={onSeekEnd}
          newPosition={progress}
          paused={paused}
          togglePaused={togglePaused}
          toggleMuted={toggleMuted}
          muted={muted}
          isLandscape={false}
          secondsDuration={duration}
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
    speedTabsContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    speedTab: {
      width: 55,
      marginLeft: spacing[2],
    },
  });
