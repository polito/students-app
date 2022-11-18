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
  playbackRate: number;
  setPlaybackRate: () => void;
}
const defaultPadding = 10;
const Normalize = (n: number) => n;

const COMPONENT_WIDTH = SCREEN_WIDTH - defaultPadding * 2;
const DRAG_DIMENSION = Normalize(30);

export const VideoControl = ({
  onRelease,
  newPosition,
  paused,
  togglePaused,
  secondsDuration,
  toggleFullscreen,
  isLandscape,
  playbackRate,
  setPlaybackRate,
}: VideoControlProps) => {
  const styles = useStylesheet(createStyles);
  const [value, setValue] = useState<number>(newPosition * 100);
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const [disableControl, setDisableControl] = useState(true);
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  // console.log('value', value, value / 100 * secondsDuration );
  // console.log('newPosition', newPosition, secondsDuration * newPosition );

  const sliderPosition = isSliding ? value / 100 : newPosition;
  const currentTime = DateTime.fromSeconds(secondsDuration * sliderPosition)
    .toUTC()
    .toFormat('HH:mm:ss');
  const duration = DateTime.fromSeconds(
    secondsDuration - secondsDuration * sliderPosition,
  )
    .toUTC()
    .toFormat('HH:mm:ss');

  const onSlidingComplete = (evt: number | Array<number>): void => {
    // @ts-ignore
    const updatedValue: number = evt[0];
    console.log('onSlidingComplete', updatedValue);
    setValue(updatedValue);
    setIsSliding(false);
    onRelease(updatedValue);
  };

  const onPressVideoControls = () => {
    if (disableControl) {
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
      setDisableControl(false);
    } else {
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 250,
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
          <VideoControlButton onPress={() => setPlaybackRate()}>
            <Text style={styles.playbackRate}>{playbackRate}x</Text>
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
              value={isSliding ? value : newPosition * 100}
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
              onSlidingStart={() => setIsSliding(true)}
              minimumValue={0.001}
              thumbTintColor={'white'}
              maximumValue={100}
              // @ts-ignore
              onValueChange={(newValue: number) => {
                setValue(newValue);
                onRelease(newValue);
              }}
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
    playbackRate: {
      color: 'white',
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
      width: size.lg * 2,
      borderRadius: size.xs,
      color: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      height: 28,
    },
  });
