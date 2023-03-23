import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { isCurrentMonth, isCurrentYear } from '../../../utils/dates';
import { AgendaDay } from '../types/AgendaDay';
import { BookingCard } from './BookingCard';
import { DeadlineCard } from './DeadlineCard';
import { EmptyDay } from './EmptyDay';
import { EmptyWeek } from './EmptyWeek';
import { ExamCard } from './ExamCard';
import { LectureCard } from './LectureCard';

interface Props {
  agendaDay: AgendaDay;
  isEmptyWeek: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const DailyAgenda = ({ agendaDay, isEmptyWeek, onLayout }: Props) => {
  const styles = useStylesheet(createStyles);
  const dayOfMonth = agendaDay.date.toFormat('d');
  const weekDay = agendaDay.date.toFormat('EEE');
  const monthOfYear =
    !isCurrentMonth(agendaDay.date) && agendaDay.date.toFormat('MMM');
  const year = !isCurrentYear(agendaDay.date) && agendaDay.date.toFormat('y');

  return (
    <Row onLayout={onLayout}>
      <Col style={styles.dayColumn} noFlex>
        {agendaDay.isToday ? (
          <View style={[styles.dayBox, styles.todayBox]}>
            <Text variant="heading" style={[styles.secondaryDay, styles.today]}>
              {weekDay}
            </Text>
            <Text variant="heading" style={styles.today}>
              {dayOfMonth}
            </Text>
          </View>
        ) : (
          <View style={styles.dayBox}>
            <Text variant="heading" style={styles.secondaryDay}>
              {weekDay}
            </Text>
            <Text variant="heading">{dayOfMonth}</Text>
            {monthOfYear && (
              <Text variant="heading" style={styles.secondaryDay}>
                {monthOfYear}
              </Text>
            )}
            {year && (
              <Text variant="heading" style={styles.secondaryDay}>
                {year}
              </Text>
            )}
          </View>
        )}
      </Col>
      <Col style={styles.itemsColumn}>
        {!agendaDay.items.length ? (
          isEmptyWeek ? (
            <EmptyWeek />
          ) : (
            <EmptyDay />
          )
        ) : (
          agendaDay?.items.map(item => {
            switch (item.type) {
              case 'booking':
                return <BookingCard key={item.key} item={item} />;
              case 'deadline':
                return <DeadlineCard key={item.key} item={item} />;
              case 'exam':
                return <ExamCard key={item.key} item={item} />;
              case 'lecture':
                return <LectureCard key={item.key} item={item} />;
              default:
                break;
            }
          })
        )}
      </Col>
    </Row>
  );
};

const createStyles = ({ colors, fontWeights, shapes, spacing }: Theme) =>
  StyleSheet.create({
    dayColumn: {
      width: '15%',
      maxWidth: 200,
      alignItems: 'stretch',
    },
    itemsColumn: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    secondaryDay: {
      textTransform: 'capitalize',
      fontWeight: fontWeights.medium,
    },
    dayBox: {
      display: 'flex',
      alignItems: 'center',
      paddingVertical: spacing[2],
    },
    todayBox: {
      display: 'flex',
      backgroundColor: colors.heading,
      borderRadius: shapes.lg,
      marginLeft: spacing[1],
      marginRight: spacing[2],
      marginTop: spacing[2],
    },
    today: {
      color: colors.surface,
    },
  });
