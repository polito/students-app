import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { DateTime } from 'luxon';

import { AgendaWeek } from '../types/AgendaWeek';
import { DailyAgenda } from './DailyAgenda';
import { EmptyWeek } from './EmptyWeek';

interface Props {
  agendaWeek: AgendaWeek;
  setCurrentDayOffset?: (offset: number) => void;
  currentDay?: DateTime;
}

export const WeeklyAgenda = ({
  agendaWeek,
  setCurrentDayOffset,
  currentDay,
}: Props) => {
  const styles = useStylesheet(createStyles);

  const newDay = useMemo(
    () =>
      currentDay ? currentDay.startOf('day') : DateTime.now().startOf('day'),
    [currentDay],
  );

  return (
    <View>
      <Text variant="secondaryText" style={styles.weekHeader} capitalize>
        {agendaWeek.dateRange.start!.toFormat('d MMM')}
        {' - '}
        {agendaWeek.dateRange.end!.minus(1).toFormat('d MMM')}
      </Text>
      {agendaWeek.data.map(day => (
        <DailyAgenda
          key={day.key}
          agendaDay={day}
          isEmptyWeek={agendaWeek.data.length === 1 && !day.items.length}
          onLayout={e => {
            day.date.weekday !== 1 &&
              day.date.equals(newDay) &&
              setCurrentDayOffset &&
              setCurrentDayOffset(e.nativeEvent.layout.y);
          }}
        />
      ))}
      {!agendaWeek.data.length && (
        <Row>
          <Col style={styles.dayColumn}></Col>
          <Col style={styles.itemsColumn}>
            <EmptyWeek />
          </Col>
        </Row>
      )}
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    weekHeader: {
      marginLeft: '15%',
      paddingBottom: spacing[2],
    },
    dayColumn: {
      width: '15%',
      maxWidth: 200,
    },
    itemsColumn: {
      flexGrow: 1,
      justifyContent: 'center',
    },
  });
