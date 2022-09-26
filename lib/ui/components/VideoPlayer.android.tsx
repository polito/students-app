import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Dimensions, StyleSheet, View } from 'react-native';
import { ResizeMode } from 'expo-av';
import { AVPlaybackStatusSuccess } from 'expo-av/src/AV.types';
import { setStatusBarHidden } from 'expo-status-bar';
import ExpoVideoPlayer from 'expo-video-player';
import { Tab } from '@lib/ui/components/Tab';
import { Text } from '@lib/ui/components/Text';
import { VideoPlayerProps } from '@lib/ui/components/VideoPlayer';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export const VideoPlayer = ({ videoUrl, coverUrl }: VideoPlayerProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = useStylesheet(createStyles);

  const navigation = useNavigation();
  const tabNavigation = navigation.getParent();

  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const windowDimensions = useMemo(() => Dimensions.get('window'), []);

  const [playerDimensions, setPlayerDimensions] = useState({
    width: windowDimensions.width,
    height: (windowDimensions.width / 16) * 9,
  });

  const enterFullscreen = async () => {
    setStatusBarHidden(true, 'none');
    setIsFullscreen(true);

    navigation.setOptions({ orientation: 'landscape', headerShown: false });
    tabNavigation.setOptions({ tabBarStyle: { display: 'none' } });

    setPlayerDimensions({
      width: windowDimensions.height,
      height: windowDimensions.width,
    });
  };

  const exitFullscreen = async () => {
    setStatusBarHidden(false, 'none');
    setIsFullscreen(false);

    navigation.setOptions({ orientation: 'portrait', headerShown: true });
    navigation.getParent().setOptions({ tabBarStyle: undefined });

    setPlayerDimensions({
      width: windowDimensions.width,
      height: (windowDimensions.width / 16) * 9,
    });
  };

  const onBackPressed = () => {
    if (isFullscreen) {
      exitFullscreen().then(() => navigation.goBack());
      return true;
    }
    return false;
  };

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', onBackPressed);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPressed);
    }, [isFullscreen]),
  );

  return (
    <ExpoVideoPlayer
      /* defaultControlsVisible={true}*/
      header={
        <View style={styles.speedSection}>
          <Text style={{ color: '#fff' }}>{t('Speed')}:</Text>
          <View style={styles.speedTabsContainer}>
            {[1, 1.5, 2, 2.5].map(rate => (
              <Tab
                key={rate}
                onPress={() => setPlaybackRate(rate)}
                textStyle={{ textAlign: 'center', color: colors.text[200] }}
                style={styles.speedTab}
                selected={playbackRate === rate}
              >
                {rate}x
              </Tab>
            ))}
          </View>
        </View>
      }
      slider={{
        thumbTintColor: colors.secondary[600],
        minimumTrackTintColor: colors.secondary[600],
        maximumTrackTintColor: colors.background,
      }}
      style={{
        height: playerDimensions.height,
        width: playerDimensions.width,
        controlsBackgroundColor: colors.heading,
      }}
      videoProps={{
        resizeMode: ResizeMode.CONTAIN,
        posterSource: {
          uri: coverUrl,
        },
        source: {
          uri: videoUrl,
        },
        status: {
          rate: playbackRate,
        },
      }}
      fullscreen={{
        inFullscreen: isFullscreen,
        enterFullscreen,
        exitFullscreen,
      }}
      playbackCallback={(status: AVPlaybackStatusSuccess) => {
        if (status.didJustFinish) {
          exitFullscreen();
        }
      }}
    />
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    speedSection: {
      width: '100%',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      textAlign: 'right',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    speedTabsContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    speedTab: {
      width: 55,
      marginLeft: spacing[2],
      opacity: 1,
    },
  });
