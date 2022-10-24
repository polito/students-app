import { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../utils/conts';
import { AgendaDayInterface } from '../../../utils/types';
import { Calendar } from './Calendar';

interface Props {
  onPressDay: (day: Date) => void;
  viewedDate: string;
  agendaDays: AgendaDayInterface[];
  onPressScrollToToday: () => void;
}

const effectiveDefaultHeight = 140;
const openedHeightPercentage = 70;
export const DAY_DIMENSION = (SCREEN_WIDTH - 60) / 7;
const HEIGHT_TO_HIDE_TOP_DATES = 100;
const distanceFromTopToBottomCalendar =
  Platform.OS === 'ios' ? 110 : 110 - StatusBar.currentHeight;

export const DrawerCalendar = ({
  onPressDay,
  viewedDate,
  agendaDays,
  onPressScrollToToday,
}: Props) => {
  const styles = useStylesheet(createItemStyles);

  const effectiveOpenedHeight = (SCREEN_HEIGHT / 100) * openedHeightPercentage;
  const drawerHeight = useRef(
    new Animated.Value(effectiveDefaultHeight),
  ).current;
  const calendarDateOpacity = useRef(new Animated.Value(1)).current;
  const calendarContainerHeight = useRef(
    new Animated.Value(DAY_DIMENSION),
  ).current;
  const calendarInfoOpacity = useRef(new Animated.Value(0)).current;
  const calendarRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        // const delta = gestureState.dy;
        const newHeight = gestureState.moveY - distanceFromTopToBottomCalendar;

        Animated.timing(drawerHeight, {
          toValue: newHeight,
          duration: 0,
          useNativeDriver: false,
        }).start();

        const newOpacity =
          1 - (newHeight - effectiveDefaultHeight) / HEIGHT_TO_HIDE_TOP_DATES;
        const infoOpacity = (newOpacity * -1 + 1) / 3;
        Animated.timing(calendarDateOpacity, {
          toValue: newOpacity,
          duration: 0,
          useNativeDriver: false,
        }).start();
        Animated.timing(calendarInfoOpacity, {
          toValue: infoOpacity,
          duration: 0,
          useNativeDriver: false,
        }).start();

        const heightFrom0 = newHeight - effectiveDefaultHeight;
        const percentageToComplete = heightFrom0 / 400;
        const newHeightCalendar =
          percentageToComplete * DAY_DIMENSION * 4 + DAY_DIMENSION;
        Animated.timing(calendarContainerHeight, {
          toValue: newHeightCalendar,
          duration: 0,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderRelease: () => {
        // @ts-ignore
        const screenPercentage = (drawerHeight._value / SCREEN_HEIGHT) * 100;
        // console.log({ screenPercentage });
        const isOpen = screenPercentage > 50;
        finishAnimation(isOpen);
        setTimeout(() => {
          if (calendarRef) {
            calendarRef.current.scrollToToday();
          }
        }, 450);
      },
    }),
  ).current;

  const finishAnimation = (isOpen: boolean) => {
    Animated.timing(drawerHeight, {
      toValue: isOpen ? effectiveOpenedHeight : effectiveDefaultHeight,
      duration: 450,
      useNativeDriver: false,
    }).start();
    Animated.timing(calendarDateOpacity, {
      toValue: isOpen ? 0 : 1,
      duration: 450,
      useNativeDriver: false,
    }).start();
    Animated.timing(calendarInfoOpacity, {
      toValue: isOpen ? 1 : 0,
      duration: 450,
      useNativeDriver: false,
    }).start();
    Animated.timing(calendarContainerHeight, {
      toValue: isOpen ? DAY_DIMENSION * 5 : DAY_DIMENSION,
      duration: 450,
      useNativeDriver: false,
    }).start();
  };

  const onPressDayCalendar = (day: Date) => {
    finishAnimation(false);
    setTimeout(() => {
      onPressDay(day);
    }, 450);
  };

  return (
    <Animated.View style={[styles.drawerContainer, { height: drawerHeight }]}>
      <Calendar
        ref={calendarRef}
        calendarDateOpacity={calendarDateOpacity}
        calendarContainerHeight={calendarContainerHeight}
        calendarInfoOpacity={calendarInfoOpacity}
        onPressDay={onPressDayCalendar}
        viewedDate={viewedDate}
        agendaDays={agendaDays}
        onPressScrollToToday={onPressScrollToToday}
      />

      <View {...panResponder.panHandlers} style={styles.dragHandlerView}>
        <View style={styles.dragHandlerView2}>
          <View style={styles.toggle} />
        </View>
      </View>
      {/* </View>*/}

      {/* <ScrollView scrollEventThrottle={100} onScrollEndDrag={onScroll} bounces={false} scrollEnabled={opened} style={styles.drawerContent}>*/}
      {/*  {children}*/}
      {/* </ScrollView>*/}
    </Animated.View>
  );
};

const createItemStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    drawerContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      marginTop: 20,
      // top: 0,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.29,
      shadowRadius: 4.65,

      elevation: 7,

      overflow: 'hidden',
      width: SCREEN_WIDTH,
      backgroundColor: colors.surface,
    },
    dragHandlerView: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      width: SCREEN_WIDTH,
      height: 40,
      paddingTop: 15,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      borderColor: 'rgb(243, 244, 246)',
      // borderBottomWidth: 6,
      borderTopWidth: 0,
    },
    dragHandlerView2: {
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggle: {
      height: 5,
      borderRadius: 5,
      width: 35,
      backgroundColor: colors.primary[700],
    },
  });
