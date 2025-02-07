import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Pressable,
  StyleSheet,
  TouchableHighlightProps,
  TouchableOpacity,
} from 'react-native';

import {
  faArrowRotateLeft,
  faArrowRotateRight,
  faCompress,
  faExpand,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { ThemeContext } from '@lib/ui/contexts/ThemeContext';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { Slider } from '@miblanchard/react-native-slider';

import { DateTime } from 'luxon';

import { negate } from '../../utils/predicates';
import { GlobalStyles } from '../styles/GlobalStyles';
import { darkTheme } from '../themes/dark';
import { GradientBackdrop } from './GradientBackdrop';

import CompositeAnimation = Animated.CompositeAnimation;

export interface VideoControlProps {
  buffering: boolean;
  /**
   * 0-1 progress percentage
   */
  progress: number;
  onProgressChange: (percentage: number) => void;
  paused: boolean;
  togglePaused: (paused?: boolean) => void;
  fullscreen: boolean;
  toggleFullscreen: () => void;
  duration: number;
  playbackRate: number;
  setPlaybackRate: () => void;
}

export const VideoControls = ({
  buffering,
  progress,
  onProgressChange,
  paused,
  togglePaused,
  duration,
  fullscreen,
  toggleFullscreen,
  playbackRate,
  setPlaybackRate,
}: VideoControlProps) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const [controlsHidden, setControlsHidden] = useState(true);
  const [sliding, setSliding] = useState(false);
  const [shouldReplay, setShouldReplay] = useState(false);
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef<CompositeAnimation | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const currentTime = DateTime.fromSeconds(duration * progress);
  const elapsedTime = currentTime.toUTC().toFormat('HH:mm:ss');
  const remainingTime = DateTime.fromSeconds(duration - duration * progress)
    .toUTC()
    .toFormat('HH:mm:ss');

  const onStartSliding = () => {
    setSliding(true);
    if (!paused) {
      setShouldReplay(true);
    }
    togglePaused(true);
  };

  const onStopSliding = (evt: number | Array<number>): void => {
    setSliding(false);
    onProgressChange((evt as number[])[0] / 100);
    if (shouldReplay) {
      togglePaused(false);
      setShouldReplay(false);
    }
  };

  useEffect(() => {
    if (opacityAnimation.current) {
      opacityAnimation.current.stop();
    }
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    opacityAnimation.current = Animated.timing(controlsOpacity, {
      toValue: controlsHidden ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    });
    opacityAnimation.current.start(() => {
      if (!controlsHidden && !paused && !buffering && !sliding) {
        hideTimeout.current = setTimeout(() => {
          setControlsHidden(true);
          hideTimeout.current = null;
        }, 5000);
      }
      opacityAnimation.current = null;
    });
  }, [controlsHidden]);

  useEffect(() => {
    if ((paused || buffering || sliding) && hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }
  }, [paused, buffering, sliding]);

  // TODO
  // eslint-disable-next-line unused-imports/no-unused-vars
  const reverse10Secs = () => {
    let newTime = currentTime.minus({ second: 10 }).toSeconds();
    newTime = Math.max(newTime, 0);
    onProgressChange(newTime / duration);
  };

  // TODO
  // eslint-disable-next-line unused-imports/no-unused-vars
  const advance10Secs = () => {
    let newTime = currentTime.plus({ second: 10 }).toSeconds();
    newTime = Math.min(newTime, duration);
    onProgressChange(newTime / duration);
  };

  return (
    <ThemeContext.Provider value={darkTheme}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: controlsOpacity }]}
      >
        <Pressable
          style={GlobalStyles.grow}
          onPress={() => setControlsHidden(negate)}
        >
          <GradientBackdrop />
          <Col
            justify="space-between"
            flex={1}
            pointerEvents={controlsHidden ? 'none' : undefined}
          >
            <Row justify="space-between">
              <VideoControlButton
                accessibilityLabel={t('videoControls.changePlaybackRate')}
                onPress={() => setPlaybackRate()}
              >
                <Text>{playbackRate}x</Text>
              </VideoControlButton>
              <VideoControlButton
                accessibilityLabel={t('videoControls.toggleFullscreen')}
                onPress={() => toggleFullscreen()}
              >
                <Icon icon={fullscreen ? faCompress : faExpand} />
              </VideoControlButton>
            </Row>

            {!buffering ? (
              <Row justify="space-around">
                <VideoControlButton
                  onPress={reverse10Secs}
                  accessibilityLabel={t('videoControls.tenSecReverse')}
                >
                  <Row align="center" gap={2}>
                    <Icon icon={faArrowRotateLeft} size={24} />
                    <Text style={styles.tenSecs}>10</Text>
                  </Row>
                </VideoControlButton>

                <VideoControlButton
                  accessibilityLabel={
                    paused ? t('common.play') : t('common.pause')
                  }
                  onPress={() => togglePaused()}
                  style={{ alignSelf: 'center' }}
                >
                  <Icon icon={paused ? faPlay : faPause} size={38} />
                </VideoControlButton>

                <VideoControlButton
                  onPress={advance10Secs}
                  accessibilityLabel={t('videoControls.tenSecForward')}
                >
                  <Row align="center" gap={2}>
                    <Text style={styles.tenSecs}>10</Text>
                    <Icon icon={faArrowRotateRight} size={24} />
                  </Row>
                </VideoControlButton>
              </Row>
            ) : (
              <ActivityIndicator size="large" />
            )}
            <Row
              align="center"
              ph={3}
              gap={1}
              pointerEvents={controlsHidden ? 'none' : undefined}
            >
              <Text style={styles.time}>{elapsedTime}</Text>
              <Slider
                value={progress * 100}
                containerStyle={styles.slider}
                // Theme-independent hardcoded color
                // eslint-disable-next-line react-native/no-color-literals
                trackStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
                maximumTrackTintColor="white"
                minimumTrackTintColor="white"
                trackMarks={[1]}
                onSlidingStart={onStartSliding}
                onSlidingComplete={onStopSliding}
                minimumValue={0.001}
                thumbTintColor="white"
                maximumValue={100}
                thumbStyle={{ width: 16, height: 16 }}
                onValueChange={evt => {
                  const val = (evt as number[])[0];
                  onProgressChange(val / 100);
                }}
              />
              <Text style={[styles.time, styles.timeRemaining]}>
                -{remainingTime}
              </Text>
            </Row>
          </Col>
        </Pressable>
      </Animated.View>
    </ThemeContext.Provider>
  );
};

const createStyles = ({ fontWeights }: Theme) =>
  StyleSheet.create({
    slider: {
      flexGrow: 1,
    },
    timeRemaining: {
      width: 52,
      textAlign: 'right',
    },
    time: {
      width: 50,
      fontSize: 10,
    },
    tenSecs: {
      fontWeight: fontWeights.bold,
    },
  });

const VideoControlButton = ({
  children,
  style,
  ...rest
}: TouchableHighlightProps) => {
  const stylesButton = useStylesheet(createStylesControl);
  return (
    <TouchableOpacity style={[stylesButton.button, style]} {...rest}>
      {children}
    </TouchableOpacity>
  );
};

const createStylesControl = ({ spacing }: Theme) =>
  StyleSheet.create({
    button: {
      padding: spacing[3],
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
