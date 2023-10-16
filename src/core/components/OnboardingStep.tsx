import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { tabBarStyle } from '../../utils/tab-bar';

interface Props {
  stepNumber: number;
  width: number;
}
export const OnboardingStep = ({ stepNumber, width }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()!.setOptions({
        tabBarStyle: { display: 'none' },
      });
      // Invalidate message list when the modal is closing
      return () => {
        navigation.getParent()!.setOptions({
          tabBarStyle: tabBarStyle,
        });
      };
    }, []),
  );

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
        <Video
          source={{
            uri: 'https://video.polito.it/public/app/onboarding_step_1_android_it.mp4',
          }}
          style={styles.video}
          resizeMode="contain"
          repeat={true}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    content: {
      paddingTop: spacing[5],
      height: '100%',
      justifyContent: 'space-between',
      gap: spacing[5],
    },
    header: {
      paddingHorizontal: spacing[5],
      gap: spacing[5],
    },
    video: {
      position: 'absolute',
      borderRadius: 25,
      borderColor: 'transparent',
      borderWidth: 1,
      height: Platform.select({ ios: '80%', android: '78%' }),
      alignSelf: 'center',
      aspectRatio: 1080 / 2340,
      bottom: Platform.select({ ios: 0, android: spacing[5] }),
      elevation: 4,
    },
  });
