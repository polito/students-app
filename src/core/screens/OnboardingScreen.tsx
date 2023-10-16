import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
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

export const OnboardingScreen = ({ navigation, route }: Props) => {
  const styles = useStylesheet(createStyles);
  const { colors } = useTheme();

  const { step } = route.params;
  const { width } = useWindowDimensions();
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(step);
  const stepsRef = useRef<FlatList>(null);

  const data = useMemo(() => [0, 1, 2, 3], []);
  const isLastStep = useMemo(
    () => currentPageIndex === data.length - 1,
    [currentPageIndex, data],
  );
  const onPrevPage = () => {
    stepsRef.current?.scrollToIndex({
      animated: true,
      index: currentPageIndex - 1,
    });
  };

  const { updatePreference } = usePreferencesContext();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()!.setOptions({
        tabBarStyle: { display: 'none' },
      });
      return () => {
        updatePreference('onboardingStep', currentPageIndex + 1);
        navigation.getParent()!.setOptions({
          tabBarStyle: tabBarStyle,
        });
      };
    }, [navigation]),
  );
  const onNextPage = () => {
    updatePreference('onboardingStep', currentPageIndex + 1);
    if (isLastStep) {
      navigation.navigate({
        name: 'ServicesTab',
        params: {
          name: 'GuidesScreen',
        },
      });
      return;
    }

    stepsRef.current?.scrollToIndex({
      animated: true,
      index: currentPageIndex + 1,
    });
  };
  return (
    <>
      <Animated.FlatList
        ref={stepsRef}
        data={data}
        horizontal
        pagingEnabled
        keyExtractor={item => item.toString()}
        onScroll={({
          nativeEvent: {
            contentOffset: { x },
          },
        }) => {
          setCurrentPageIndex(Math.max(0, Math.round(x / width)));
        }}
        scrollEventThrottle={100}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={2}
        renderItem={({ item }) => (
          <OnboardingStep stepNumber={item} width={width} />
        )}
      />
      <View style={styles.fixedContainer}>
        <View style={styles.dotsContainer}>
          <AnimatedDotsCarousel
            length={4}
            currentIndex={currentPageIndex}
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
          {currentPageIndex > 0 && (
            <Col flex={1}>
              <CtaButton
                variant="outlined"
                absolute={false}
                title="Back"
                action={onPrevPage}
                containerStyle={styles.buttonContainer}
              />
            </Col>
          )}

          <Animated.View style={{ flex: 1 }}>
            <CtaButton
              absolute={false}
              title={isLastStep ? 'Guide' : 'Next'}
              action={onNextPage}
              containerStyle={styles.buttonContainer}
            />
          </Animated.View>
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
