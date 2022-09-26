import React, { useMemo, useState } from 'react';
import { ResizeMode, Video } from 'expo-av';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Tab } from '@lib/ui/components/Tab';
import { Text } from '@lib/ui/components/Text';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '@lib/ui/types/theme';

export interface VideoPlayerProps {
  videoUrl: string;
  coverUrl: string;
}

export const VideoPlayer = ({ videoUrl, coverUrl }: VideoPlayerProps) => {

  const width = useMemo(() => Dimensions.get('window').width, []);
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const speedControls = useMemo(
    () => {
      // if (parseInt(Platform.Version as string, 10) >= 16)
      // return; // Speed controls are included in native player since iOS 16

      return <View style={styles.speedSection}>
        <Text variant='headline'>{t('Speed')}:</Text>
        <View style={styles.speedTabsContainer}>
          {
            [1, 1.5, 2, 2.5].map((rate) =>
              <Tab key={rate} onPress={() => setPlaybackRate(rate)}
                   textStyle={{ textAlign: 'center' }}
                   style={styles.speedTab}
                   selected={playbackRate === rate}>
                {rate}x
              </Tab>,
            )
          }
        </View>
      </View>;
    },
    [playbackRate],
  );


  return <View>
    <Video
      style={{
        height: (width / 16) * 9,
      }}
      source={{
        uri: videoUrl,
      }}
      posterSource={{
        uri: coverUrl,
      }}
      rate={playbackRate}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
    />
    {speedControls}
  </View>;
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