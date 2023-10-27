import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import AnimatedDotsCarousel from 'react-native-animated-dots-carousel';

import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TeachingStackParamList } from '../../features/teaching/components/TeachingNavigator';
import { tabBarStyle } from '../../utils/tab-bar';
import { OnboardingStep } from '../components/OnboardingStep';
import { usePreferencesContext } from '../contexts/PreferencesContext';

type Props = NativeStackScreenProps<TeachingStackParamList, 'OnboardingModal'>;

const ONBOARDING_STEPS = 4;

export const OnboardingModal = ({ navigation }: Props) => {
  const styles = useStylesheet(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { width } = useWindowDimensions();
  const stepsRef = useRef<ScrollView>(null);

  // Init data as the memoized array from 0 to ONBOARDING_STEPS
  const data = useMemo(() => [...Array(ONBOARDING_STEPS).keys()], []);

  const { updatePreference, onboardingStep } = usePreferencesContext();

  const [currentStep, setCurrentStep] = useState<number>(onboardingStep ?? 0);

  const isLastStep = useMemo(
    () => currentStep === data.length - 1,
    [currentStep, data],
  );

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()!.setOptions({
        tabBarStyle: { display: 'none' },
      });
      return () => {
        navigation.getParent()!.setOptions({
          tabBarStyle: tabBarStyle,
        });
      };
    }, [navigation]),
  );

  // Update the onboarding step in preferences
  useEffect(() => {
    if (onboardingStep !== undefined && currentStep <= onboardingStep) {
      // Don't update the preference if the user is going back
      return;
    }
    updatePreference('onboardingStep', currentStep);
  }, [currentStep, onboardingStep, updatePreference]);

  useLayoutEffect(() => {
    // Workaround for scroll action not working on first render for iOS devices
    setTimeout(() => {
      stepsRef.current?.scrollTo({
        animated: false,
        x: currentStep * width,
      });
    }, 200);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsRef.current]);

  const onPrevPage = () =>
    stepsRef.current?.scrollTo({
      animated: true,
      x: (currentStep - 1) * width,
    });

  const onNextPage = useCallback(() => {
    if (isLastStep) {
      const parent = navigation.getParent()!;

      parent.reset({
        index: 1,
        routes: [
          { name: 'TeachingTab' },
          { name: 'ServicesTab', params: { screen: 'Guides', initial: false } },
        ],
      });

      return;
    }
    stepsRef.current?.scrollTo({
      animated: true,
      x: (currentStep + 1) * width,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isLastStep, navigation]);
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
          setCurrentStep(currentIndex);
        }}
        scrollEventThrottle={100}
        showsHorizontalScrollIndicator={false}
      >
        {data.map(item => (
          <OnboardingStep key={item} stepNumber={item} width={width} />
        ))}
      </ScrollView>
      <View style={styles.fixedContainer}>
        <View style={styles.dotsContainer}>
          <AnimatedDotsCarousel
            length={4}
            currentIndex={currentStep}
            maxIndicators={4}
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
      </View>
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
