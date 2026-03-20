import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Video from 'react-native-video';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import BaseBottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
  SCREEN_HEIGHT,
} from '@gorhom/bottom-sheet';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { OnboardingStep } from '../components/OnboardingStep';
import { useSplashContext } from '../contexts/SplashContext';
import {
  useGetOnboardingAnnouncements,
  useMarkAnnouncementAsRead,
} from '../queries/announcementHooks';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const OnboardingModal = ({ visible, onClose }: Props) => {
  const styles = useStylesheet(createStyles);
  const { colors, shapes, spacing } = useTheme();
  const { t } = useTranslation();
  const { hideOnboarding } = useSplashContext();
  const bottomSheetRef = useRef<BaseBottomSheet>(null);
  const animatedPosition = useSharedValue(SCREEN_HEIGHT);

  const { data: announcements } = useGetOnboardingAnnouncements();
  const { mutate: markAsRead } = useMarkAnnouncementAsRead();

  const stepsRef = useRef<typeof announcements>(undefined);

  if (!stepsRef.current && announcements?.some(a => !a.seen)) {
    stepsRef.current = announcements.filter(a => !a.seen);
  }

  const unseenAnnouncements = useMemo(
    () => stepsRef.current ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stepsRef.current],
  );
  const totalSteps = unseenAnnouncements.length;

  // Preload all media from all steps
  const { imageUrls, videoUrls } = useMemo(() => {
    const images: string[] = [];
    const videos: string[] = [];
    for (const a of unseenAnnouncements) {
      const imgMatches = a.contents.matchAll(
        /<img\b[^>]*src=["']([^"']+)["']/gi,
      );
      for (const m of imgMatches) images.push(m[1]);
      const videoMatches = a.contents.matchAll(
        /<video\b[^>]*src=["']([^"']+)["']/gi,
      );
      for (const m of videoMatches) videos.push(m[1]);
      if (a.cover) images.push(a.cover);
    }
    return { imageUrls: images, videoUrls: videos };
  }, [unseenAnnouncements]);

  const [imagesReady, setImagesReady] = useState(imageUrls.length === 0);
  const [videosReadyCount, setVideosReadyCount] = useState(0);
  const preloadStarted = useRef(false);

  const mediaReady = imagesReady && videosReadyCount >= videoUrls.length;

  // Prefetch images natively
  useEffect(() => {
    if (preloadStarted.current || imageUrls.length === 0) return;
    preloadStarted.current = true;

    let settled = 0;
    const total = imageUrls.length;
    const onSettled = () => {
      settled++;
      if (settled >= total) setImagesReady(true);
    };

    for (const src of imageUrls) {
      Image.prefetch(src).then(onSettled).catch(onSettled);
    }
  }, [imageUrls]);

  const onVideoPreloaded = useCallback(() => {
    setVideosReadyCount(prev => prev + 1);
  }, []);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const markedAsReadRef = useRef<Set<string>>(new Set());

  const isLastStep = useMemo(
    () => totalSteps > 0 && currentStep === totalSteps - 1,
    [currentStep, totalSteps],
  );

  const isFirstStep = currentStep === 0;

  const markStepAsRead = useCallback(
    (stepIndex: number) => {
      const announcement = unseenAnnouncements[stepIndex];
      if (announcement && !markedAsReadRef.current.has(announcement.id)) {
        markedAsReadRef.current.add(announcement.id);
        markAsRead(announcement.id);
      }
    },
    [unseenAnnouncements, markAsRead],
  );

  const handleClose = useCallback(() => {
    hideOnboarding();
    onClose();
  }, [hideOnboarding, onClose]);

  const onNextPage = useCallback(() => {
    markStepAsRead(currentStep);
    if (isLastStep) {
      handleClose();
      return;
    }
    setCurrentStep(prev => prev + 1);
  }, [currentStep, isLastStep, markStepAsRead, handleClose]);

  const onPreviousPage = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  const maxHeight = SCREEN_HEIGHT * 0.9;

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={spacing[8]}>
        <View style={styles.footerRow}>
          {!isFirstStep && (
            <CtaButton
              absolute={false}
              icon={faArrowLeft}
              variant="outlined"
              action={onPreviousPage}
              containerStyle={{ paddingRight: 0 }}
            />
          )}
          <CtaButton
            absolute={false}
            title={isLastStep ? t('common.close') : t('common.next')}
            action={onNextPage}
            containerStyle={{ flex: 1 }}
          />
        </View>
      </BottomSheetFooter>
    ),
    [
      isFirstStep,
      isLastStep,
      onPreviousPage,
      onNextPage,
      t,
      spacing,
      styles.footerRow,
    ],
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedPosition.value,
      [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.05],
      [0, 0.4],
    ),
  }));

  const currentAnnouncement = unseenAnnouncements[currentStep];

  if (!visible || totalSteps === 0 || !currentAnnouncement) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={[StyleSheet.absoluteFill, !mediaReady && { opacity: 0 }]}
      pointerEvents={mediaReady ? 'auto' : 'none'}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      {/* Hidden native video preloaders */}
      {videoUrls.map(src => (
        <Video
          key={src}
          source={{ uri: src }}
          paused
          muted
          onLoad={onVideoPreloaded}
          onError={onVideoPreloaded}
          style={styles.hiddenVideo}
        />
      ))}
      <BaseBottomSheet
        ref={bottomSheetRef}
        index={0}
        enableDynamicSizing
        maxDynamicContentSize={maxHeight}
        enablePanDownToClose={false}
        enableHandlePanningGesture={false}
        enableContentPanningGesture={false}
        animatedPosition={animatedPosition}
        handleComponent={null}
        backgroundStyle={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: shapes.lg,
          borderTopRightRadius: shapes.lg,
        }}
        style={{
          overflow: 'hidden',
          borderTopLeftRadius: shapes.lg,
          borderTopRightRadius: shapes.lg,
        }}
        footerComponent={renderFooter}
      >
        <OnboardingStep
          title={currentAnnouncement.title}
          html={currentAnnouncement.contents}
          cover={currentAnnouncement.cover}
          ScrollViewComponent={BottomSheetScrollView}
        />
      </BaseBottomSheet>
    </GestureHandlerRootView>
  );
};

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.black,
    },
    footerRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
    },
    hiddenVideo: {
      width: 0,
      height: 0,
      position: 'absolute',
    },
  });
