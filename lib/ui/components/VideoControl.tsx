import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';

import { DateTime } from 'luxon';

export interface VideoControlProps {
  onRelease: (percentage: number) => void;
  newPosition: number;
  paused: boolean;
  togglePaused: () => void;
  rotate: boolean;
  secondsDuration: number;
}
const defaultPadding = 10;
const Normalize = (n: number) => n;

const WIDTH_DEVICE = Dimensions.get('window').width;
const COMPONENT_WIDTH = WIDTH_DEVICE - defaultPadding * 2;
const DRAG_DIMENSION = Normalize(30);
const LINE_WIDTH =
  COMPONENT_WIDTH - DRAG_DIMENSION - Normalize(15) - Normalize(5);

export const VideoControl = ({
  onRelease,
  newPosition,
  paused,
  togglePaused,
  rotate,
  secondsDuration,
}: VideoControlProps) => {
  // const secondsDuration = useSelector(postSelectors.selectedVideoDuration);
  const currentTime = DateTime.fromSeconds(secondsDuration * newPosition)
    .toUTC()
    .toFormat('HH:mm:ss');
  const duration = DateTime.fromSeconds(secondsDuration)
    .toUTC()
    .toFormat('HH:mm:ss');

  const [disableAutoMove, setDisableAutoMove] = useState(false);
  const sliderLeft = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        setDisableAutoMove(true);
        console.log({ ...gestureState });
        console.log('moveX ' + gestureState.moveX);

        const newDistanceLeft =
          gestureState.moveX - defaultPadding * 2 - Normalize(20);
        console.log({
          newDistanceLeft,
          tot: WIDTH_DEVICE - defaultPadding * 1.5,
        });

        if (gestureState.moveX > WIDTH_DEVICE - defaultPadding * 1.5) {
          return;
        }
        if (newDistanceLeft < 0) {
          return;
        }
        Animated.timing(sliderLeft, {
          toValue: newDistanceLeft,
          duration: 0,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log('moveX ' + gestureState.moveX);
        const newDistanceLeft =
          gestureState.moveX - defaultPadding * 2 - Normalize(20);
        const percentage = newDistanceLeft / LINE_WIDTH;
        console.log({ percentage });
        onRelease(percentage);
        setTimeout(() => {
          setDisableAutoMove(false);
        }, 200);
      },
    }),
  ).current;

  useEffect(() => {
    if (!disableAutoMove) {
      const newDistanceLeft = newPosition * LINE_WIDTH;
      Animated.timing(sliderLeft, {
        toValue: newDistanceLeft,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [newPosition]);

  return (
    <Col noFlex flexStart style={[styles.wrapper]}>
      <Row alignCenter>
        {/* <FontAwesomeIcon style={[rotate && styles.rotateIcon]} icon={paused ? 'fas fa-play' : 'fas fa-pause'} onPress={togglePaused} size={Normalize(15)}/>*/}

        <Row noFlex alignCenter style={styles.container}>
          <View style={styles.hr} />

          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.dragHandlerView, { left: sliderLeft }]}
          >
            <View style={styles.dragHandler} />
          </Animated.View>
        </Row>
      </Row>
      <Text>Duration: {duration}</Text>
      <Text>Tempo corrente {currentTime}</Text>
    </Col>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    height: Normalize(50),
    // marginLeft: -defaultPadding,
    paddingHorizontal: defaultPadding,
    // backgroundColor: 'blue',
  },
  container: {
    height: Normalize(50),
    marginLeft: Normalize(5),
    marginBottom: 20,
  },
  hr: {
    width: LINE_WIDTH,
    marginLeft: DRAG_DIMENSION / 2,
    height: Normalize(3),
    borderRadius: 5,
    backgroundColor: 'black',
  },
  toggle: {},
  dragHandlerView: {
    height: Normalize(50),
    width: Normalize(30),
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  dragHandler: {
    width: Normalize(13),
    height: Normalize(13),
    backgroundColor: 'black',
    borderRadius: Normalize(50),
  },
  rowTime: {
    width: LINE_WIDTH,
    marginLeft: defaultPadding * 2,
  },
  textTime: {},
  textTimeRotate: {
    transform: [{ rotate: '90deg' }],
    marginTop: 4,
  },
  rotateIcon: {
    transform: [{ rotate: '90deg' }],
  },
});
