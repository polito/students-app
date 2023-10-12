import { useState } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import AnimatedDotsCarousel from 'react-native-animated-dots-carousel';
import { ScrollView } from 'react-native-gesture-handler';

import { Col } from '@lib/ui/components/Col';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { OnboardingStep } from '../components/OnboardingStep';

// export type Props = {
//     content:
// }

export const OnboardingScreen = () => {
  const actionButton = () => {};
  const styles = useStylesheet(createStyles);
  const { colors } = useTheme();

  const { width } = useWindowDimensions();
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Animated.FlatList
          data={[0, 1, 2, 3]}
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
          renderItem={({ item }) => (
            <OnboardingStep stepNumber={item} width={width} />
          )}
        />
      </ScrollView>
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
        {currentPageIndex === 0 && (
          <CtaButton absolute={false} title="Next" action={actionButton} />
        )}

        {currentPageIndex > 0 && (
          <Row gap={2} ph={4}>
            <Col flex={1} style={{ flex: 1, backgroundColor: 'yellow' }}>
              <CtaButton
                absolute={false}
                title="Next"
                action={actionButton}
                containerStyle={styles.buttonContainer}
              />
            </Col>
            <Col style={{ flex: 1 }}>
              <CtaButton
                absolute={false}
                title="Next"
                action={actionButton}
                containerStyle={styles.buttonContainer}
              />
            </Col>
          </Row>
        )}
      </View>
    </>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    fixedContainer: {
      paddingVertical: spacing[5],
      gap: spacing[2],
    },
    dotsContainer: {
      alignItems: 'center',
    },
    buttonContainer: {
      paddingHorizontal: 0,
    },
  });
