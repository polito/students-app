import { useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useSplashContext } from '../contexts/SplashContext';
import { useGetModalMessages } from '../queries/studentHooks';
import { ONBOARDING_STEPS } from '../screens/OnboardingModal';
import { RootParamList } from '../types/navigation';

export const useModalManager = (versionModalIsOpen?: boolean) => {
  const { isSplashLoaded } = useSplashContext();
  const { onboardingStep } = usePreferencesContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const routes = navigation.getState()?.routes?.[0]?.state?.routes;
  const isOnBoardingClosed = routes
    ? !routes.some(route => route.name === 'OnboardingModal')
    : undefined;

  const { data: messages } = useGetModalMessages();

  useEffect(() => {
    if (!isSplashLoaded) return;
    if (onboardingStep && onboardingStep >= ONBOARDING_STEPS - 1) return;
    if (versionModalIsOpen === false) {
      navigation.navigate('TeachingTab', {
        screen: 'OnboardingModal',
        initial: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSplashLoaded, navigation, versionModalIsOpen]);

  useEffect(() => {
    if (
      onboardingStep === undefined ||
      (!isOnBoardingClosed && onboardingStep < ONBOARDING_STEPS - 1) ||
      !isSplashLoaded
    ) {
      return;
    }
    if (versionModalIsOpen === false) {
      if (!messages || messages.length === 0) return;
      navigation.navigate('TeachingTab', {
        screen: 'MessagesModal',
        initial: false,
      });
    }
  }, [
    messages,
    versionModalIsOpen,
    navigation,
    onboardingStep,
    isSplashLoaded,
    isOnBoardingClosed,
  ]);
};
