import React, { useRef, useState } from 'react';
import {
  Animated,
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

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../src/utils/conts';

export interface VideoControlProps {
  onRelease: (percentage: number) => void;
  newPosition: number;
  paused: boolean;
  togglePaused: () => void;
  muted?: boolean;
  toggleMuted?: () => void;
  fullscreen?: boolean;
  toggleFullscreen?: () => void;
  isLandscape: boolean;
  secondsDuration: number;
}
const defaultPadding = 10;
const Normalize = (n: number) => n;

const COMPONENT_WIDTH = SCREEN_WIDTH - defaultPadding * 2;
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
  isLandscape,
}: VideoControlProps) => {
  // console.log({ secondsDuration, newPosition });
  const [disableControl, setDisableControl] = useState(true);
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const currentTime = DateTime.fromSeconds(secondsDuration * newPosition)
    .toUTC()
    .toFormat('HH:mm:ss');
  const duration = DateTime.fromSeconds(
    secondsDuration - secondsDuration * newPosition,
  )
    .toUTC()
    .toFormat('HH:mm:ss');

  const styles = useStylesheet(createStyles);
  const [value, setValue] = useState<number>(newPosition * 100);

  const onSlidingComplete = (evt: number | Array<number>): void => {
    // @ts-ignore
    const updatedValue: number = evt[0];
    console.log('onSlidingComplete', updatedValue);
    setValue(updatedValue);
    onRelease(updatedValue);
  };

  const onPressVideoControls = () => {
    if (disableControl) {
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setDisableControl(false);
    } else {
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setDisableControl(true);
    }
  };

  return (
    <Animated.View
      style={[styles.animatedWrapper, { opacity: animatedOpacity }]}
    >
      <Col
        noFlex
        flexStart
        spaceBetween
        style={[styles.wrapper, isLandscape && styles.wrapperLandscape]}
        onPress={onPressVideoControls}
      >
        <Row
          noFlex
          maxWidth
          spaceBetween
          style={[styles.header, isLandscape && styles.headerLandscape]}
          pointerEvents={disableControl ? 'none' : undefined}
        >
          <VideoControlButton onPress={() => toggleMuted()}>
            <Icon name={muted ? 'volume-off' : 'volume-high'} color={'white'} />
          </VideoControlButton>
          <VideoControlButton onPress={() => toggleFullscreen()}>
            <Icon name={'ios-scan'} color={'white'} />
          </VideoControlButton>
        </Row>
        <Row
          alignCenter
          justifyCenter
          noFlex
          style={styles.wrapperControl}
          pointerEvents={disableControl ? 'none' : undefined}
        >
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
              value={value}
              // @ts-ignore
              containerStyle={[
                styles.slider,
                isLandscape && styles.sliderLandscape,
              ]}
              trackStyle={{ backgroundColor: 'white' }}
              maximumTrackTintColor={'white'}
              minimumTrackTintColor={'white'}
              trackMarks={[1]}
              onSlidingComplete={onSlidingComplete}
              minimumValue={0.001}
              thumbTintColor={'white'}
              maximumValue={100}
              // @ts-ignore
              onValueChange={setValue}
            />
            <Text style={styles.timeRemaining}>-{duration}</Text>
          </Row>
        </Row>
      </Col>
    </Animated.View>
  );
};

const createStyles = ({ size }: Theme) =>
  StyleSheet.create({
    slider: {
      width: SCREEN_WIDTH - 200,
    },
    sliderLandscape: {
      width: SCREEN_HEIGHT - 200,
    },
    header: {
      top: 10,
    },
    headerLandscape: {
      top: 20,
    },
    timeRemaining: {
      width: 50,
      color: 'white',
      fontSize: 10,
      textAlign: 'right',
    },
    time: {
      width: 46,
      color: 'white',
      fontSize: 10,
    },
    wrapperControl: {
      paddingBottom: 10,
    },
    sliderControlWrapper: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      height: 28,
      borderRadius: size.xs,
      marginLeft: 10,
      paddingHorizontal: size.xs,
    },
    animatedWrapper: {
      position: 'absolute',
      top: 0,
    },
    wrapper: {
      width: SCREEN_WIDTH,
      height: (SCREEN_WIDTH / 16) * 9,
      paddingHorizontal: defaultPadding,
    },
    wrapperLandscape: {
      width: SCREEN_HEIGHT,
      height: SCREEN_WIDTH,
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
