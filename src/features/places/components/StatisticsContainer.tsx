import { StyleSheet, View } from 'react-native';

import {
  faClock,
  faElevator,
  faRoad,
  faStairs,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';

type StatisticsContainerProps = {
  avoidStairs: boolean;
  totDistance: number;
  stairsOrElevators: number;
};

export const StatisticsContainer = ({
  avoidStairs,
  totDistance,
  stairsOrElevators,
}: StatisticsContainerProps) => {
  const styles = useStylesheet(createStyles);
  const { dark, palettes } = useTheme();

  function formatDistance(meters: number): string {
    if (meters >= 1000) {
      const km = meters / 1000;
      return `${km.toFixed(2)} km`;
    } else {
      return `${meters.toFixed(2)} m`;
    }
  }

  function formatWalkingTime(
    distanceMeters: number,
    stairsorElevatorsCount: number = 0,
    avoid: boolean = false,
  ): string {
    // Average walking speed ≈ 5 km/h = 1.39 m/s
    const walkingSpeedMps = 5000 / 3600;

    let totalSeconds = distanceMeters / walkingSpeedMps;

    if (!avoid) {
      // Stairs penalty: 30 s per flight
      totalSeconds += stairsorElevatorsCount * 30;
    } else {
      // Elevator penalty: 90 s per use (waiting + travel)
      totalSeconds += stairsorElevatorsCount * 90;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      if (minutes === 0) return `< 1 min`;
      return `${minutes} min`;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.statistic}>
        <Icon
          icon={faRoad}
          color={palettes.gray[dark ? 300 : 600]}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: palettes.text[900] }]}>
          {formatDistance(totDistance)}
        </Text>
      </View>
      <View style={styles.statistic}>
        <Icon
          icon={faClock}
          color={palettes.gray[dark ? 300 : 600]}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: palettes.text[900] }]}>
          {formatWalkingTime(totDistance, stairsOrElevators, avoidStairs)}
        </Text>
      </View>
      <View style={styles.statistic}>
        <Icon
          icon={avoidStairs ? faElevator : faStairs}
          color={palettes.gray[dark ? 300 : 600]}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: palettes.text[900] }]}>
          {stairsOrElevators.toString()}
        </Text>
      </View>
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      alignItems: 'flex-start',
      gap: 22,
    },
    statistic: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    icon: {
      display: 'flex',
      width: 20,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
    },
    text: {
      overflow: 'hidden',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: 21,
    },
  });
