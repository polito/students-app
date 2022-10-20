import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

import { SCREEN_WIDTH } from '../../../utils/conts';
import { CalendarService, Day } from './CalendarService';

import Value = Animated.Value;

interface Props {
  onPressDay: (day: Date) => void;
  calendarDateOpacity: Value;
  calendarContainerHeight: Value;
  calendarInfoOpacity: Value;
  viewedDate: string;
}

const Normalize = (n: number) => n;
export const DAY_DIMENSION = (SCREEN_WIDTH - 60) / 7;

export const Calendar = forwardRef(
  (
    {
      calendarDateOpacity,
      calendarContainerHeight,
      calendarInfoOpacity,
      onPressDay,
      viewedDate,
    }: Props,
    ref: ForwardedRef<any>,
  ) => {
    const styles = useStylesheet(createItemStyles);
    // const myFutureReservationsGrouped = useSelector(getMyFutureReservationGrouped);
    // const reservations: any[] = [];
    // const reservations = useSelector(smartItemSelectors.myReservationCalendarList);
    const service = useRef(new CalendarService()).current;
    const [weeks, setWeeks] = useState([]);
    const [fistOpen, setFirstOpen] = useState(true);
    const flatListRef = useRef(null);

    useImperativeHandle(ref, () => ({
      scrollToToday,
    }));

    useEffect(() => {
      if (viewedDate) {
        const tempWeeks = service.getMonthCalendar(new Date()).weeks;
        setWeeks(tempWeeks);
        if (fistOpen) {
          setTimeout(() => {
            scrollToToday(tempWeeks);
            setFirstOpen(false);
          }, 500);
        }
        scrollToToday(tempWeeks);
      }
    }, [viewedDate]);

    useEffect(() => {
      // const month = DateTime.fromJSDate(_.get(weeks, '[1].days[6].date', '')).toFormat('MM-yyyy');
      // getMyReservationList(month, ReservationsScreenId);
    }, [weeks]);

    const scrollToToday = (tempWeeks = weeks) => {
      if (flatListRef.current && tempWeeks.length) {
        tempWeeks.forEach((week, index) => {
          week.days.forEach((day: Day) => {
            const isToday =
              DateTime.fromJSDate(day.date).toISODate() === viewedDate;
            if (isToday) {
              try {
                flatListRef.current.scrollToIndex({
                  animated: true,
                  index: index,
                });
              } catch (e) {
                console.log({ errorFlatList: e });
              }
            }
          });
        });
      }
    };

    const onPressNextMonth = () => {
      const nextMonthDate = DateTime.fromJSDate(weeks[1].days[6].date)
        .plus({ month: 1 })
        .toJSDate();
      const tempWeeks = service.getMonthCalendar(nextMonthDate).weeks;
      setWeeks(tempWeeks);
    };
    const onPressPrevMonth = () => {
      const nextMonthDate = DateTime.fromJSDate(weeks[1].days[6].date)
        .minus({ month: 1 })
        .toJSDate();
      const tempWeeks = service.getMonthCalendar(nextMonthDate).weeks;
      setWeeks(tempWeeks);
    };

    const mappedWeeks = useMemo(() => {
      return weeks.map(week => {
        let id = '';
        week.days.forEach((day: Day) => {
          id += day.monthDay;
        });
        return { ...week, id };
      });
    }, [weeks]);

    // const reservationDots = useMemo(() => {
    // const state = store.getState();
    // const userDetail = getUserDetail(state);
    // const newCalendar = generateDotFromReservations({reservations, userDetail});
    // const newReal = _.map(newCalendar, (value, key) => {
    //   return {
    //     date: DateTime.fromFormat(key, 'yyyy-MM-dd').toFormat('dd/MM/yyyy'),
    //     dots: value.dots,
    //   };
    // });
    // return newReal;
    // }, [reservations]);

    const month = useMemo(() => {
      return DateTime.fromJSDate(
        weeks.length ? weeks[1].days[6].date : '',
      ).toFormat('MMMM yyyy');
    }, [weeks]);

    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.calendarContainer,
            { height: calendarContainerHeight },
          ]}
        >
          <Animated.View
            style={[styles.extraInfo, { opacity: calendarInfoOpacity }]}
          >
            <Row
              justifyCenter
              spaceAround
              alignCenter
              style={{ marginBottom: Normalize(10) }}
            >
              <CalendarMonthIcon
                iconName={'chevron-back-outline'}
                onPress={onPressPrevMonth}
              />
              <Text style={styles.month}>{month}</Text>
              <CalendarMonthIcon
                iconName={'chevron-forward-outline'}
                onPress={onPressNextMonth}
              />
              {/* <FontAwesomeIcon*/}
              {/*  style={styles.icon}*/}
              {/*  icon={'fas fa-chevron-left'}*/}
              {/*  onPress={onPressPrevMonth}*/}
              {/*/ >*/}
              {/* <FontAwesomeIcon*/}
              {/*  style={styles.icon}*/}
              {/*  icon={'fas fa-chevron-right'}*/}
              {/*  onPress={onPressNextMonth}*/}
              {/*/ >*/}
            </Row>
            <Row style={styles.headerDays}>
              <Text style={styles.textDay}>{'Mon'}</Text>
              <Text style={styles.textDay}>{'Tue'}</Text>
              <Text style={styles.textDay}>{'Wed'}</Text>
              <Text style={styles.textDay}>{'Thu'}</Text>
              <Text style={styles.textDay}>{'Fri'}</Text>
              <Text style={styles.textDay}>{'Sat'}</Text>
              <Text style={styles.textDay}>{'Sun'}</Text>
            </Row>
          </Animated.View>
          <FlatList
            ref={flatListRef}
            style={styles.calendar}
            data={mappedWeeks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <RenderRow
                item={item}
                formattedViewedDate={viewedDate}
                onPressDay={onPressDay}
              />
            )}
            // ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.calendarContainerStyle}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            extraData={{ viewedDate }}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 700));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              });
            }}
          />
        </Animated.View>

        {/* <Col style={styles.calendar} noFlex>*/}
        {/*  {weeks.map(week => {*/}
        {/*    return (*/}
        {/*      <Row spaceBetween width={'100%'}>*/}
        {/*        {week.days.map(day => {*/}
        {/*          return (*/}
        {/*            <TouchableOpacity style={styles.day}>*/}
        {/*              <Text>{day.monthDay}</Text>*/}
        {/*            </TouchableOpacity>*/}
        {/*          );*/}
        {/*        })}*/}
        {/*      </Row>*/}
        {/*    );*/}
        {/*  })}*/}
        {/* </Col>*/}

        <Animated.View
          style={[styles.topDays, { opacity: calendarDateOpacity }]}
        >
          <Text style={styles.textDay}>{'Mon'}</Text>
          <Text style={styles.textDay}>{'Tue'}</Text>
          <Text style={styles.textDay}>{'Wed'}</Text>
          <Text style={styles.textDay}>{'Thu'}</Text>
          <Text style={styles.textDay}>{'Fri'}</Text>
          <Text style={styles.textDay}>{'Sat'}</Text>
          <Text style={styles.textDay}>{'Sun'}</Text>
        </Animated.View>
      </View>
    );
  },
);

interface CalendarMonthIconProps {
  iconName: string;
  onPress: () => void;
}

const CalendarMonthIcon = ({ iconName, onPress }: CalendarMonthIconProps) => {
  const { colors, fontSizes } = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Icon
        name={iconName}
        color={colors.primary[500]}
        size={fontSizes['2xl']}
        // style={{ marginRight: -spacing[1] }}
      />
    </Pressable>
  );
};

interface RowProp {
  item: {
    days: any[];
  };
  formattedViewedDate: string;
  onPressDay: (day: Date) => void;
}

const RenderRow = ({ item, formattedViewedDate, onPressDay }: RowProp) => {
  const styles = useStylesheet(createItemStyles);

  return (
    <Row spaceBetween width={'100%'}>
      {item.days.map(day => {
        const formattedDay = DateTime.fromJSDate(day.date).toISODate();
        const isViewed = formattedDay === formattedViewedDate;
        const isToday = DateTime.now().toISODate() === formattedDay;
        // const dots = _.get(
        //   reservationDots.find(rd => rd.date === formattedDay),
        //   'dots',
        //   [],
        // );
        // const dots = [];
        // const disable = day.daysFromToday < 0 || day.daysFromToday > 90;
        const disable = false;
        return (
          <TouchableOpacity
            key={formattedDay}
            style={styles.touchableDay}
            onPress={() => onPressDay(day.date)}
            disabled={disable}
          >
            <View
              style={[
                styles.day,
                isToday && styles.today,
                isViewed && styles.isViewed,
              ]}
            >
              <Text
                style={[
                  styles.textDayCalendar,
                  isViewed && styles.textTodayCalendar,
                  disable && styles.textDayDisable,
                ]}
              >
                {day.monthDay}
              </Text>
              {/* TODO*/}
              {/* <Row style={styles.rowDots} alignCenter justifyCenter noFlex>*/}
              {/*  {dots.map(dot => {*/}
              {/*    return (*/}
              {/*      <View*/}
              {/*        style={[*/}
              {/*          styles.dot,*/}
              {/*          {*/}
              {/*            backgroundColor: isViewed ? 'red' : 'blue',*/}
              {/*          },*/}
              {/*        ]}*/}
              {/*      />*/}
              {/*    );*/}
              {/*  })}*/}
              {/* </Row>*/}
            </View>
          </TouchableOpacity>
        );
      })}
    </Row>
  );
};

const createItemStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    topDays: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      width: SCREEN_WIDTH,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: Normalize(20),
      backgroundColor: 'white',
    },
    extraInfo: {
      position: 'absolute',
      top: -Normalize(70),
    },
    headerDays: {
      width: SCREEN_WIDTH,
      paddingHorizontal: Normalize(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    month: {
      fontSize: Normalize(22),
      // fontFamily: POPPINS_MEDIUM,
    },
    icon: {
      borderColor: 'red',
      borderWidth: 1,
      padding: Normalize(7),
      borderRadius: Normalize(9),
    },
    calendarContainer: {},
    calendar: {
      width: '100%',
      paddingHorizontal: Normalize(20),
    },

    calendarContainerStyle: {
      // height: DAY_DIMENSION * 5,
      // backgroundColor: 'blue',
    },
    touchableDay: {
      width: DAY_DIMENSION,
      height: DAY_DIMENSION,
      padding: 4,
    },
    day: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Normalize(11),
      flex: 1,
      // marginHorizontal: Normalize(5),
    },
    today: {
      backgroundColor: '#E1FFFC',
      borderWidth: 1,
      borderColor: 'blue',
      borderRadius: Normalize(11),
      // backgroundColor: PRIMARY_COLOR,
      // borderRadius: Normalize(40),
    },
    isViewed: {
      backgroundColor: 'blue',
      borderRadius: Normalize(11),
    },
    textTodayCalendar: {
      color: 'white',
      // fontFamily: POPPINS_SEMI_BOLD,
    },
    textDayDisable: {
      color: 'grey',
    },
    textDayCalendar: {
      color: 'black',
    },
    textDay: {
      color: 'black',
    },
    rowDots: {
      // position: 'absolute',
      // bottom: Normalize(10)
      height: 10,
      // backgroundColor: 'blue',
    },
    dot: {
      width: Normalize(4),
      height: Normalize(4),
      borderRadius: Normalize(5),
      marginHorizontal: 1,
    },
  });
