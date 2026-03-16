import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import AnimatedDotsCarousel from 'react-native-animated-dots-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { resetNavigationStatusTo } from '~/utils/navigation';

import { TeachingStackParamList } from '../../features/teaching/components/TeachingNavigator';
import { OnboardingStep } from '../components/OnboardingStep';
import { useSplashContext } from '../contexts/SplashContext';
import { useHideTabs } from '../hooks/useHideTabs';
import {
  useGetOnboardingAnnouncements,
  useMarkAnnouncementAsRead,
} from '../queries/announcementHooks';

type Props = NativeStackScreenProps<TeachingStackParamList, 'OnboardingModal'>;

export const OnboardingModal = ({ navigation }: Props) => {
  const styles = useStylesheet(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { hideOnboarding } = useSplashContext();

  const [width, setWidth] = useState<number>(0);
  const stepsRef = useRef<ScrollView>(null);

  const { data: announcements } = useGetOnboardingAnnouncements();
  const { mutate: markAsRead } = useMarkAnnouncementAsRead();

  const unseenAnnouncements = useMemo(
    () => announcements?.filter(a => !a.seen) ?? [],
    [announcements],
  );

  const totalSteps = unseenAnnouncements.length;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const markedAsReadRef = useRef<Set<string>>(new Set());

  const isLastStep = useMemo(
    () => totalSteps > 0 && currentStep === totalSteps - 1,
    [currentStep, totalSteps],
  );

  const markStepAsRead = useCallback(
    (stepIndex: number) => {
      const announcement = unseenAnnouncements[stepIndex];
      if (announcement && !markedAsReadRef.current.has(announcement.id)) {
        markedAsReadRef.current.add(announcement.id);
        markAsRead(announcement.id);
        console.warn('read');
      }
    },
    [unseenAnnouncements, markAsRead],
  );

  useHideTabs(undefined, hideOnboarding);

  useLayoutEffect(() => {
    if (width === 0) {
      return;
    }
    // Workaround for scroll action not working on first render for iOS devices
    setTimeout(() => {
      stepsRef.current?.scrollTo({
        animated: false,
        x: currentStep * width,
      });
    }, 200);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsRef.current, width]);

  const onPrevPage = () =>
    stepsRef.current?.scrollTo({
      animated: true,
      x: (currentStep - 1) * width,
    });

  const onNextPage = useCallback(() => {
    markStepAsRead(currentStep);
    if (isLastStep) {
      navigation.popToTop();
      resetNavigationStatusTo(navigation, 'ServicesTab', [
        { name: 'Services' },
        { name: 'Guides' },
      ]);
      return;
    }
    stepsRef.current?.scrollTo({
      animated: true,
      x: (currentStep + 1) * width,
    });
  }, [currentStep, isLastStep, navigation, width, markStepAsRead]);

  if (totalSteps === 0) {
    return null;
  }

  return (
    <>
      <ScrollView
        ref={stepsRef}
        horizontal
        pagingEnabled
        onScroll={({
          nativeEvent: {
            contentOffset: { x },
          },
        }) => {
          const currentIndex = Math.max(0, Math.round(x / width));
          if (currentIndex === currentStep) {
            return;
          }
          markStepAsRead(currentStep);
          setCurrentStep(currentIndex);
        }}
        scrollEventThrottle={100}
        showsHorizontalScrollIndicator={false}
        onLayout={e => {
          const { width: scrollViewWidth } = e.nativeEvent.layout;
          setWidth(scrollViewWidth);
        }}
      >
        {unseenAnnouncements.map(announcement => (
          <OnboardingStep
            key={announcement.id}
            title={announcement.title}
            description={announcement.description}
            html={announcement.contents}
            width={width}
          />
        ))}
      </ScrollView>
      <SafeAreaView style={styles.fixedContainer}>
        <View style={styles.dotsContainer}>
          <AnimatedDotsCarousel
            length={totalSteps}
            currentIndex={currentStep}
            maxIndicators={totalSteps}
            activeIndicatorConfig={{
              color: colors.heading,
              margin: 3,
              opacity: 1,
              size: 6,
            }}
            inactiveIndicatorConfig={{
              color: colors.heading,
              margin: 3,
              opacity: 0.5,
              size: 6,
            }}
            decreasingDots={[
              {
                config: {
                  color: colors.heading,
                  margin: 3,
                  opacity: 0.5,
                  size: 5,
                },
                quantity: 1,
              },
              {
                config: {
                  color: colors.heading,
                  margin: 3,
                  opacity: 0.5,
                  size: 4,
                },
                quantity: 1,
              },
            ]}
          />
        </View>
        <Row gap={2} ph={4}>
          <Col flex={1}>
            {currentStep > 0 && (
              <CtaButton
                variant="outlined"
                absolute={false}
                title={t('common.back')}
                action={onPrevPage}
                containerStyle={styles.buttonContainer}
              />
            )}
          </Col>

          <Col flex={1}>
            <CtaButton
              absolute={false}
              title={isLastStep ? t('guideScreen.title') : t('common.next')}
              action={onNextPage}
              containerStyle={styles.buttonContainer}
            />
          </Col>
        </Row>
      </SafeAreaView>
    </>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    fixedContainer: {
      paddingVertical: Platform.select({
        ios: spacing[5],
        android: spacing[0],
      }),
      gap: spacing[2],
    },
    dotsContainer: {
      alignItems: 'center',
    },
    buttonContainer: {
      paddingHorizontal: 0,
    },
  });
