import { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';


import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../utils/conts';
import { Calendar } from './Calendar';

interface Props {
  onPressDay: (day: Date) => void;
  viewedDate: string;
}

const defaultHeightPercentage = 10;
const openedHeightPercentage = 70;
export const DAY_DIMENSION = (SCREEN_WIDTH - 60) / 7;
const HEIGHT_TO_HIDE_TOP_DATES = 100;
const distanceFromTopToBottomCalendar = 110;

export const DrawerCalendar = ({ onPressDay, viewedDate }: Props) => {
  const styles = useStylesheet(createItemStyles);

  const effectiveDefaultHeight =
    (SCREEN_HEIGHT / 100) * defaultHeightPercentage;
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
      <View
        style={{
          height: '100%',
          width: SCREEN_WIDTH,
          backgroundColor: 'white',
          overflow: 'hidden',
        }}
      >
        <Calendar
          ref={calendarRef}
          calendarDateOpacity={calendarDateOpacity}
          calendarContainerHeight={calendarContainerHeight}
          calendarInfoOpacity={calendarInfoOpacity}
          onPressDay={onPressDayCalendar}
          viewedDate={viewedDate}
        />

        <View {...panResponder.panHandlers} style={styles.dragHandlerView}>
          <View style={styles.dragHandlerView2}>
            <View style={styles.toggle} />
          </View>
        </View>
      </View>

      {/* <ScrollView scrollEventThrottle={100} onScrollEndDrag={onScroll} bounces={false} scrollEnabled={opened} style={styles.drawerContent}>*/}
      {/*  {children}*/}
      {/* </ScrollView>*/}
    </Animated.View>
  );
};

const createItemStyles = () =>
  StyleSheet.create({
    drawerContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      marginTop: 20,
      backgroundColor: 'white',
      // top: 0,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    dragHandlerView: {
      backgroundColor: 'transparent',
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
      borderBottomWidth: 6,
      borderTopWidth: 0,
    },
    dragHandlerView2: {
      // backgroundColor: 'blue',
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggle: {
      height: 7,
      borderRadius: 5,
      width: 40,
      backgroundColor: '#DADBDC',
    },
  });
