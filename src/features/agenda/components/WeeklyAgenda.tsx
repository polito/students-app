import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { usePreferencesContext } from '~/core/contexts/PreferencesContext.ts';
import { APP_TIMEZONE } from '~/utils/dates.ts';

import { DateTime } from 'luxon';

import { processLectures } from '../hooks/useProcessedLectures';
import { AgendaDay } from '../types/AgendaDay';
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
  const { accessibility, courses } = usePreferencesContext();
  const newDay = useMemo(
    () =>
      currentDay
        ? currentDay.startOf('day')
        : DateTime.now().setZone(APP_TIMEZONE).startOf('day'),
    [currentDay],
  );

  const processedWeek = useMemo(() => {
    const processed: AgendaDay[] = [];
    agendaWeek.data.forEach(day => {
      const filteredItems = processLectures(day.items, courses);
      if (filteredItems.length > 0) {
        processed.push({
          ...day,
          items: filteredItems,
        });
      }
    });
    return processed;
  }, [agendaWeek.data, courses]);

  return (
    <View>
      <Text variant="secondaryText" style={styles.weekHeader} capitalize>
        {agendaWeek.dateRange.start!.toFormat('d MMM')}
        {' - '}
        {agendaWeek.dateRange.end!.minus(1).toFormat('d MMM')}
      </Text>
      {processedWeek.map(day => (
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
      {!processedWeek.length && (
        <Row>
          <Col style={styles.dayColumn}></Col>
          <Col
            style={[
              styles.itemsColumn,
              accessibility?.fontSize && accessibility.fontSize >= 150
                ? { paddingRight: '15%' }
                : {},
            ]}
          >
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
