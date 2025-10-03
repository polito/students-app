import { useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useSplashContext } from '../contexts/SplashContext';
import { useCheckMfa } from '../queries/authHooks';
import { useGetModalMessages } from '../queries/studentHooks';
import { ONBOARDING_STEPS } from '../screens/OnboardingModal';
import { RootParamList } from '../types/navigation';

export const useModalManager = (versionModalIsOpen?: boolean) => {
  const { isSplashLoaded } = useSplashContext();
  const { onboardingStep, politoAuthnEnrolmentStatus } =
    usePreferencesContext();
  const hideInitialPrompt = politoAuthnEnrolmentStatus?.hideInitialPrompt;
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const routes = navigation.getState()?.routes?.[0]?.state?.routes;
  const isOnBoardingClosed = routes
    ? !routes.some(route => route.name === 'OnboardingModal')
    : undefined;
  const { data: mfaStatus, isPending: mfaStatusPending } = useCheckMfa();

  const { data: messages } = useGetModalMessages();
  const showMfaPrompt = mfaStatus?.status === 'available' && !hideInitialPrompt;
  useEffect(() => {
    if (!isSplashLoaded) return;
    if (!showMfaPrompt) return;
    navigation.navigate('TeachingTab', {
      screen: 'PolitoAuthenticator',
      params: { activeView: 'enroll' },
    });
  }, [showMfaPrompt, navigation, isSplashLoaded]);

  useEffect(() => {
    if (showMfaPrompt || mfaStatusPending) return;
    if (!isSplashLoaded) return;
    if (onboardingStep && onboardingStep >= ONBOARDING_STEPS - 1) return;
    if (versionModalIsOpen) return;
    navigation.navigate('TeachingTab', {
      screen: 'OnboardingModal',
      initial: false,
    });
  }, [
    isSplashLoaded,
    navigation,
    versionModalIsOpen,
    onboardingStep,
    showMfaPrompt,
    mfaStatusPending,
  ]);

  useEffect(() => {
    if (showMfaPrompt || mfaStatusPending) return;
    if (!isSplashLoaded) return;
    if (
      !isOnBoardingClosed ||
      onboardingStep === undefined ||
      onboardingStep < ONBOARDING_STEPS - 1
    )
      return;
    if (versionModalIsOpen) return;
    if (!messages || messages.length === 0) return;
    navigation.navigate('TeachingTab', {
      screen: 'MessagesModal',
      initial: false,
    });
  }, [
    messages,
    versionModalIsOpen,
    navigation,
    onboardingStep,
    isSplashLoaded,
    showMfaPrompt,
    isOnBoardingClosed,
    mfaStatusPending,
  ]);
};
