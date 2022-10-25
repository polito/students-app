import {
  ForwardedRef,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
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
import { Theme } from '@lib/ui/types/theme';

import _ from 'lodash';
import { DateTime } from 'luxon';

import { SCREEN_WIDTH } from '../../../utils/conts';
import { AgendaDayInterface, AgendaItemInterface } from '../../../utils/types';
import { CalendarService, Day } from './CalendarService';
import { WeekDays } from './WeekDays';

import Value = Animated.Value;

interface Props {
  onPressDay: (day: Date) => void;
  calendarDateOpacity: Value;
  calendarContainerHeight: Value;
  calendarInfoOpacity: Value;
  viewedDate: string;
  agendaDays: AgendaDayInterface[];
  onPressScrollToToday: () => void;
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
      agendaDays,
      onPressScrollToToday,
    }: Props,
    ref: ForwardedRef<any>,
  ) => {
    const { t } = useTranslation();
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
        const tempWeeks = service.getMonthCalendar(
          DateTime.fromISO(viewedDate).toJSDate(),
        ).weeks;
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
      return _.upperFirst(
        DateTime.fromJSDate(weeks.length ? weeks[1].days[6].date : '').toFormat(
          'MMMM yyyy',
        ),
      );
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
              alignCenter
              style={{ marginBottom: Normalize(10), borderColor: 'blue' }}
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
            </Row>
            <WeekDays style={styles.headerDays} />
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
                agendaDays={agendaDays}
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

        <Animated.View
          style={[styles.topDays, { opacity: calendarDateOpacity }]}
        >
          <Row noFlex maxWidth spaceBetween alignCenter>
            <Text style={styles.textMonthPreview} capitalize>
              {DateTime.fromISO(viewedDate).toFormat('MMMM')}
            </Text>
            <Pressable onPress={() => onPressScrollToToday()}>
              <Text style={styles.textGoToToday}>{t('Back to today')}</Text>
            </Pressable>
          </Row>
          <WeekDays />
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
  agendaDays: AgendaDayInterface[];
}

const DOT_COLORS: Record<string, string> = {
  Booking: 'blue',
  Exam: 'red',
  Lecture: 'green',
};
const RenderRow = memo(
  ({ item, formattedViewedDate, onPressDay, agendaDays }: RowProp) => {
    const styles = useStylesheet(createItemStyles);

    return (
      <Row spaceBetween width={'100%'}>
        {item.days.map(day => {
          const formattedDay = DateTime.fromJSDate(day.date).toISODate();
          const isViewed = formattedDay === formattedViewedDate;
          const isToday = DateTime.now().toISODate() === formattedDay;

          const agendaDay = agendaDays.find(ad => ad.id === formattedDay);
          let dots: string[] = [];
          if (agendaDay && agendaDay.items.length) {
            dots = agendaDay.items.map((agendaItem: AgendaItemInterface) => {
              return DOT_COLORS[agendaItem.type];
            });
          }
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
              </View>
              <Row style={styles.rowDots} alignCenter justifyCenter noFlex>
                {dots.map((dot: string, index: number) => {
                  return (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: dot,
                        },
                      ]}
                    />
                  );
                })}
              </Row>
            </TouchableOpacity>
          );
        })}
      </Row>
    );
  },
);

const createItemStyles = ({ colors, fontWeights }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    topDays: {
      position: 'absolute',
      top: 30,
      left: 0,
      right: 0,
      width: SCREEN_WIDTH,
      paddingHorizontal: Normalize(20),
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
      fontWeight: fontWeights.semibold,
      color: colors.title,
      width: SCREEN_WIDTH * 0.7,
      textAlign: 'center',
    },
    icon: {
      borderColor: 'red',
      borderWidth: 1,
      padding: Normalize(7),
      borderRadius: Normalize(9),
    },
    calendarContainer: {
      marginTop: 65,
    },
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
      alignItems: 'center',
      paddingTop: 5,
    },
    day: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Normalize(30),
      width: DAY_DIMENSION * 0.6,
      height: DAY_DIMENSION * 0.6,
    },
    today: {
      borderRadius: Normalize(30),
      borderColor: colors.primary[400],
      borderWidth: 1,
    },
    isViewed: {
      backgroundColor: colors.secondary[500],
      borderRadius: Normalize(30),
    },
    textTodayCalendar: {
      // color: 'white',
      // fontFamily: POPPINS_SEMI_BOLD,
    },
    textDayDisable: {
      color: 'grey',
    },
    textDayCalendar: {
      color: colors.title,
      fontWeight: fontWeights.medium,
      fontSize: 12,
    },
    textDay: {
      color: colors.text[600],
      minWidth: 30,
      fontSize: 14,
      textAlign: 'center',
      fontWeight: fontWeights.semibold,
      flex: 1,
    },
    textMonthPreview: {
      color: colors.title,
      fontSize: 16,
      marginBottom: 3,
      fontWeight: fontWeights.semibold,
    },
    textGoToToday: {
      color: colors.primary[400],
      fontWeight: fontWeights.normal,
      fontSize: 12,
    },
    rowDots: {
      // position: 'absolute',
      // bottom: Normalize(10)
      height: 10,
      // backgroundColor: 'blue',
    },
    dot: {
      width: Normalize(5),
      height: Normalize(5),
      borderRadius: Normalize(5),
      marginHorizontal: 1,
    },
  });
