import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlightProps,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { Slider } from '@miblanchard/react-native-slider';

import { DateTime } from 'luxon';

export interface VideoControlProps {
  onRelease: (percentage: number) => void;
  newPosition: number;
  paused: boolean;
  togglePaused: () => void;
  muted?: boolean;
  toggleMuted?: () => void;
  fullscreen?: boolean;
  toggleFullscreen?: () => void;
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
  const duration = DateTime.fromSeconds(
    secondsDuration - secondsDuration * newPosition,
  )
    .toUTC()
    .toFormat('HH:mm:ss');
  const styles = useStylesheet(createStyles);
  const [value, setValue] = useState<number>(0);
  const [value1, setValue1] = useState<number>(value);

  const onSlidingComplete = (evt: number | Array<number>): void => {
    // @ts-ignore
    const updatedValue: number = evt[0];
    console.log('onSlidingComplete', updatedValue);
    setValue(updatedValue);
    onRelease(updatedValue);
  };

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
      <Row alignCenter justifyCenter noFlex style={{ paddingBottom: 10 }}>
        <VideoControlButton onPress={() => togglePaused()}>
          <Icon name={paused ? 'play' : 'pause'} color={'white'} />
        </VideoControlButton>
        <Row
          style={styles.sliderControlWrapper}
          alignCenter
          spaceBetween
          justifyCenter
        >
          <Text style={styles.time}>{currentTime}</Text>
          <Slider
            value={value1}
            containerStyle={{
              marginTop: 0,
              width: WIDTH_DEVICE * 0.5,
            }}
            trackStyle={{ backgroundColor: 'white' }}
            maximumTrackTintColor={'white'}
            minimumTrackTintColor={'white'}
            trackMarks={[1]}
            onSlidingComplete={onSlidingComplete}
            minimumValue={0.001}
            thumbTintColor={'white'}
            maximumValue={100}
            // @ts-ignore
            onValueChange={setValue1}
          />
          <Text style={styles.timeRemaining}>-{duration}</Text>
        </Row>
      </Row>
    </Col>
  );
};

const createStyles = ({ size }: Theme) =>
  StyleSheet.create({
    timeRemaining: {
      width: 50,
      color: 'white',
      fontSize: 10,
    },
    time: {
      width: 46,
      color: 'white',
      fontSize: 10,
    },
    sliderControlWrapper: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      height: 28,
      borderRadius: size.sm,
      marginHorizontal: 10,
      paddingHorizontal: size.xs,
    },
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: size.md,
      paddingVertical: size.xs + 1.5,
      borderRadius: size.xs,
      color: 'white',
    },
  });
