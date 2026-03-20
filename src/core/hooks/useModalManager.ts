import { useEffect, useMemo, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../contexts/PreferencesContext';
import { useSplashContext } from '../contexts/SplashContext';
import { useGetOnboardingAnnouncements } from '../queries/announcementHooks';
import { useCheckMfa } from '../queries/authHooks';
import { useGetModalMessages } from '../queries/studentHooks';
import { RootParamList } from '../types/navigation';

export const useModalManager = (versionModalIsOpen?: boolean) => {
  const { isSplashLoaded, didHideOnboarding } = useSplashContext();
  const { politoAuthnEnrolmentStatus } = usePreferencesContext();
  const hideInitialPrompt = politoAuthnEnrolmentStatus?.hideInitialPrompt;
  const navigation = useNavigation<NativeStackNavigationProp<RootParamList>>();
  const { data: mfaStatus, isPending: mfaStatusPending } = useCheckMfa();

  const { data: messages } = useGetModalMessages();
  const { data: onboardingAnnouncements } = useGetOnboardingAnnouncements();

  const hasUnseenOnboarding = useMemo(
    () => onboardingAnnouncements?.some(a => !a.seen) ?? false,
    [onboardingAnnouncements],
  );

  const showMfaPrompt = mfaStatus?.status === 'available' && !hideInitialPrompt;

  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

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
    if (didHideOnboarding) return;
    if (!hasUnseenOnboarding) return;
    if (versionModalIsOpen) return;
    setIsOnboardingVisible(true);
  }, [
    isSplashLoaded,
    versionModalIsOpen,
    didHideOnboarding,
    hasUnseenOnboarding,
    showMfaPrompt,
    mfaStatusPending,
  ]);

  useEffect(() => {
    if (showMfaPrompt || mfaStatusPending) return;
    if (!isSplashLoaded) return;
    if (hasUnseenOnboarding && !didHideOnboarding) return;
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
    isSplashLoaded,
    showMfaPrompt,
    didHideOnboarding,
    hasUnseenOnboarding,
    mfaStatusPending,
  ]);

  return {
    isOnboardingVisible,
    closeOnboarding: () => setIsOnboardingVisible(false),
  };
};
