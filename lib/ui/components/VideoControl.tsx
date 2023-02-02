import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlightProps,
  TouchableOpacity,
} from 'react-native';

import {
  faCompress,
  faExpand,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { Slider } from '@miblanchard/react-native-slider';

import { DateTime } from 'luxon';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../src/utils/const';

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
  const statusBarHeight = useMemo(() => StatusBar.currentHeight, []);
  const [value, setValue] = useState(newPosition * 100);
  const [isSliding, setIsSliding] = useState(false);
  const [disableControl, setDisableControl] = useState(true);
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const sliderPosition =
    isSliding || (paused && !isSliding) ? value / 100 : newPosition;
  const currentTime = DateTime.fromSeconds(secondsDuration * sliderPosition)
    .toUTC()
    .toFormat('HH:mm:ss');
  const duration = DateTime.fromSeconds(
    secondsDuration - secondsDuration * sliderPosition,
  )
    .toUTC()
    .toFormat('HH:mm:ss');

  const onSlidingComplete = (evt: number | Array<number>): void => {
    const updatedValue = (evt as number[])[0];
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
        style={[
          styles.wrapper,
          isLandscape && {
            ...styles.wrapperLandscape,
            height: SCREEN_WIDTH - statusBarHeight,
          },
        ]}
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
            <Icon icon={paused ? faCompress : faExpand} color={'white'} />
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
            <Icon icon={paused ? faPlay : faPause} color={'white'} />
          </VideoControlButton>
          <Row
            style={styles.sliderControlWrapper}
            alignCenter
            spaceBetween
            justifyCenter
          >
            <Text style={styles.time}>{currentTime}</Text>
            <Slider
              value={
                isSliding || (paused && !isSliding) ? value : newPosition * 100
              }
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
              onValueChange={newValue => {
                const val = newValue as number;
                setValue(val);
                onRelease(val);
              }}
            />
            <Text style={styles.timeRemaining}>-{duration}</Text>
          </Row>
        </Row>
      </Col>
    </Animated.View>
  );
};

const createStyles = ({ spacing }: Theme) =>
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
    headerLandscape: {},
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
      borderRadius: Number(spacing['2']),
      marginLeft: 10,
      paddingHorizontal: Number(spacing['2']),
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
      height: SCREEN_WIDTH * 0.9,
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

const createStylesControl = ({ shapes }: Theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      width: shapes.lg * 2,
      borderRadius: shapes.md,
      color: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      height: 28,
    },
  });
