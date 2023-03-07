import { StyleSheet } from 'react-native';

import { AgendaCardProps } from '@lib/ui/components/AgendaCard';
import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { isCurrentMonth, isCurrentYear } from '../../../utils/dates';
import { AgendaDay } from '../types/AgendaDay';
import { DeadlineCard } from './DeadlineCard';
import { EmptyDay } from './EmptyDay';
import { ExamCard } from './ExamCard';
import { LectureCard } from './LectureCard';

interface Props {
  agendaDay: AgendaDay;
}

export const DailyAgenda = ({ agendaDay }: Props) => {
  const styles = useStylesheet(createStyles);
  const dayOfMonth = agendaDay.date.toFormat('d');
  const weekDay = agendaDay.date.toFormat('EEE');
  const monthOfYear =
    !isCurrentMonth(agendaDay.date) && agendaDay.date.toFormat('MMM');
  const year = !isCurrentYear(agendaDay.date) && agendaDay.date.toFormat('y');

  return (
    <Row>
      <Col
        style={[
          styles.dayColumn,
          agendaDay.isToday ? styles.todayColumn : undefined,
        ]}
        flexStart
        noFlex
      >
        <Text
          variant="heading"
          style={[
            styles.secondaryDay,
            agendaDay.isToday ? styles.today : undefined,
          ]}
        >
          {weekDay}
        </Text>
        <Text
          variant="heading"
          style={[agendaDay.isToday ? styles.today : undefined]}
        >
          {dayOfMonth}
        </Text>
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
      </Col>
      <Col style={styles.itemsColumn}>
        {}
        {!agendaDay.items.length ? (
          <EmptyDay />
        ) : (
          agendaDay.items.map(item => {
            const typeDependentProps: Partial<AgendaCardProps> = {};

            switch (item.type) {
              case 'booking':
                typeDependentProps.time = `${item.fromTime} - ${item.toTime}`;
                break;
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
      paddingTop: spacing[2],
      display: 'flex',
      alignItems: 'center',
    },
    itemsColumn: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    secondaryDay: {
      textTransform: 'capitalize',
      fontWeight: fontWeights.medium,
    },
    todayColumn: {
      backgroundColor: colors.heading,
      borderRadius: shapes.lg,
      paddingBottom: spacing[1],
    },
    today: {
      color: colors.surface,
    },
  });
