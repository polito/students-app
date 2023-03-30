import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

import { Tab } from '@lib/ui/components/Tab';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export interface VideoPlayerProps {
  videoUrl: string;
  coverUrl: string;
}

export const VideoPlayer = ({ videoUrl, coverUrl }: VideoPlayerProps) => {
  const width = useMemo(() => Dimensions.get('window').width, []);
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();

  const [playbackRate, setPlaybackRate] = useState(1);

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
              children={rate + 'x'}
            />
          ))}
        </View>
      </View>
    );
  }, [playbackRate]);

  return (
    <View>
      <Video
        controls={true}
        style={{
          height: (width / 16) * 9,
        }}
        source={{
          uri: videoUrl,
        }}
        poster={coverUrl}
        rate={playbackRate}
        resizeMode="contain"
      />
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
