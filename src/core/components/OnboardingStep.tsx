import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { usePreferencesContext } from '../contexts/PreferencesContext';

interface Props {
  stepNumber: number;
  width: number;
}

export const OnboardingStep = ({ stepNumber, width }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { language } = usePreferencesContext();

  const [isLoading, setIsLoading] = useState(true);

  const videoUrl = useMemo(() => {
    return `https://video.polito.it/public/app/onboarding_step_${
      stepNumber + 1
    }_${Platform.OS}_${language}.mp4`;
  }, [language, stepNumber]);

  return (
    <SafeAreaView>
      <View style={[{ width }, styles.content]}>
        <View style={styles.header}>
          <Text variant="title" role="heading">
            {t(`onboardingScreen.steps.${stepNumber}.title`)}
          </Text>
          <Text variant="prose" role="definition">
            {t(`onboardingScreen.steps.${stepNumber}.content`)}
          </Text>
        </View>
        <View style={styles.videoContainer}>
          <Video
            onReadyForDisplay={() => {
              setIsLoading(false);
            }}
            source={{
              uri: videoUrl,
            }}
            style={[styles.video, isLoading && styles.loadingVideo]}
            resizeMode="contain"
            repeat={true}
          />
          {isLoading && <ActivityIndicator style={styles.activityIndicator} />}
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = ({ dark, spacing, palettes }: Theme) =>
  StyleSheet.create({
    content: {
      paddingTop: spacing[5],
      height: '100%',
      gap: spacing[5],
      paddingVertical: spacing[5],
    },
    header: {
      paddingHorizontal: spacing[5],
      gap: spacing[5],
    },
    video: {
      borderRadius: 25,
      borderColor: 'transparent',
      borderWidth: 1,
      alignSelf: 'center',
      aspectRatio: 1080 / 2340,
      elevation: 4,
      flexGrow: 1,
    },
    loadingVideo: {
      backgroundColor: dark ? palettes.gray[600] : palettes.gray[200],
    },
    activityIndicator: {
      position: 'absolute',
      alignSelf: 'center',
    },
    videoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1,
    },
  });
