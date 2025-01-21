import { StyleSheet } from 'react-native';
import AnimatedDotsCarousel from 'react-native-animated-dots-carousel';

import { useStylesheet } from '../hooks/useStylesheet';
import { Theme } from '../types/Theme';

type Props = {
  carouselLength: number;
  carouselIndex: number;
  expandedDotsCounts?: number;
  hasDecreasingDots?: boolean;
};

export const CarouselDots = ({
  carouselLength,
  carouselIndex,
  expandedDotsCounts = carouselLength,
}: Props) => {
  const styles = useStylesheet(createStyles);

  return (
    <AnimatedDotsCarousel
      length={carouselLength ?? 0}
      currentIndex={carouselIndex}
      maxIndicators={expandedDotsCounts}
      activeIndicatorConfig={{
        size: 10,
        ...styles.indicator,
        ...styles.activeIndicator,
      }}
      inactiveIndicatorConfig={{
        size: 10,
        ...styles.indicator,
        ...styles.inactiveIndicator,
      }}
      decreasingDots={[
        {
          config: {
            ...styles.indicator,
            ...styles.inactiveIndicator,
            size: 8,
          },
          quantity: 1,
        },
        {
          config: {
            ...styles.indicator,
            ...styles.inactiveIndicator,
            size: 6,
          },
          quantity: 1,
        },
      ]}
    />
  );
};

const createStyles = ({ palettes, dark }: Theme) =>
  StyleSheet.create({
    indicator: {
      margin: 3,
      opacity: 1,
    },
    activeIndicator: {
      color: palettes.navy[500],
    },
    inactiveIndicator: {
      color: dark ? palettes.gray[400] : palettes.gray[300],
    },
  });
