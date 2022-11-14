import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableHighlightProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { DateTime } from 'luxon';

export interface VideoControlProps {
  onRelease: (percentage: number) => void;
  newPosition: number;
  paused: boolean;
  togglePaused: () => void;
  muted: boolean;
  toggleMuted: () => void;
  fullscreen: boolean;
  toggleFullscreen: () => void;
  rotate: boolean;
  secondsDuration: number;
}
const defaultPadding = 10;
const Normalize = (n: number) => n;

const WIDTH_DEVICE = Dimensions.get('window').width;
const COMPONENT_WIDTH = WIDTH_DEVICE - defaultPadding * 2;
const DRAG_DIMENSION = Normalize(30);
const LINE_WIDTH =
  COMPONENT_WIDTH - DRAG_DIMENSION - Normalize(30) - Normalize(5);

export const VideoControl = ({
  onRelease,
  newPosition,
  paused,
  togglePaused,
  toggleMuted,
  muted,
  secondsDuration,
  toggleFullscreen,
  fullscreen,
}: VideoControlProps) => {
  // const secondsDuration = useSelector(postSelectors.selectedVideoDuration);
  const currentTime = DateTime.fromSeconds(secondsDuration * newPosition)
    .toUTC()
    .toFormat('HH:mm:ss');
  const duration = DateTime.fromSeconds(secondsDuration)
    .toUTC()
    .toFormat('HH:mm:ss');
  const styles = useStylesheet(createStyles);
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
    <Col noFlex flexStart spaceBetween style={[styles.wrapper]}>
      <Row noFlex maxWidth spaceBetween>
        <VideoControlButton onPress={() => toggleMuted()}>
          <Icon name={muted ? 'volume-off' : 'volume-high'} color={'white'} />
        </VideoControlButton>
        <VideoControlButton onPress={() => toggleFullscreen()}>
          <Icon name={'ios-scan'} color={'white'} />
        </VideoControlButton>
      </Row>
      <Row alignCenter justifyCenter noFlex>
        <VideoControlButton onPress={() => togglePaused()}>
          <Icon name={paused ? 'play' : 'pause'} color={'white'} />
        </VideoControlButton>
        <Row noFlex alignCenter style={styles.container}>
          <View style={styles.hrContainer}>
            <View style={styles.hr} />
          </View>

          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.dragHandlerView, { left: sliderLeft }]}
          >
            <View style={styles.dragHandler} />
          </Animated.View>
        </Row>
      </Row>
      {/* <Text>Duration: {duration}</Text> */}
      {/* <Text>Tempo corrente {currentTime}</Text> */}
    </Col>
  );
};

const createStyles = ({ size }: Theme) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      top: 0,
      width: WIDTH_DEVICE,
      height: (WIDTH_DEVICE / 16) * 9,
      // backgroundColor: 'red',
      // marginLeft: -defaultPadding,
      paddingHorizontal: defaultPadding,
      // backgroundColor: 'blue',
    },
    container: {
      height: Normalize(50),
      // marginBottom: 20,
    },
    hr: {
      width: LINE_WIDTH,
      marginLeft: DRAG_DIMENSION / 2,
      height: Normalize(3),
      borderRadius: 5,
      backgroundColor: 'white',
    },
    hrContainer: {
      paddingVertical: 10,
      paddingHorizontal: 5,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderRadius: size.xs,
    },
    toggle: {},
    dragHandlerView: {
      height: Normalize(50),
      width: Normalize(DRAG_DIMENSION),
      position: 'absolute',
      top: 0,
      alignItems: 'center',
      justifyContent: 'center',
      // backgroundColor: 'rgba(255, 0, 0, 0.2)',
    },
    dragHandler: {
      width: Normalize(13),
      height: Normalize(13),
      backgroundColor: 'white',
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

const VideoControlButton = ({ children, ...rest }: TouchableHighlightProps) => {
  const stylesButton = useStylesheet(createStylesControl);
  return (
    <TouchableOpacity style={stylesButton.button} {...rest}>
      {children}
    </TouchableOpacity>
  );
};

const createStylesControl = ({ size }: Theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      paddingHorizontal: size.md,
      paddingVertical: size.xs,
      borderRadius: size.xs,
      color: 'white',
    },
  });
