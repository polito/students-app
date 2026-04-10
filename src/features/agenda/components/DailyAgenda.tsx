import { useTranslation } from 'react-i18next';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { isCurrentMonth, isCurrentYear } from '~/utils/dates.ts';

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
  const { i18n } = useTranslation();
  const dayOfMonth = agendaDay.date.toFormat('d');
  const weekDay = agendaDay.date.toFormat('EEE');
  const monthOfYear =
    !isCurrentMonth(agendaDay.date) && agendaDay.date.toFormat('MMM');
  const year = !isCurrentYear(agendaDay.date) && agendaDay.date.toFormat('y');

  const dayAccessibilityLabel = agendaDay.date
    .setLocale(i18n.language)
    .toLocaleString({
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...(year ? { year: 'numeric' } : {}),
    });

  return (
    <Row onLayout={onLayout}>
      <Col style={styles.dayColumn} align="stretch">
        {agendaDay.isToday ? (
          <View
            style={[styles.dayBox, styles.todayBox]}
            accessible={true}
            accessibilityLabel={dayAccessibilityLabel}
          >
            <Text
              variant="heading"
              style={[styles.secondaryDay, styles.today]}
              importantForAccessibility="no"
            >
              {weekDay}
            </Text>
            <Text
              variant="heading"
              style={styles.today}
              importantForAccessibility="no"
            >
              {dayOfMonth}
            </Text>
          </View>
        ) : (
          <View
            style={styles.dayBox}
            accessible={true}
            accessibilityLabel={dayAccessibilityLabel}
          >
            <Text
              variant="heading"
              style={styles.secondaryDay}
              importantForAccessibility="no"
            >
              {weekDay}
            </Text>
            <Text variant="heading" importantForAccessibility="no">
              {dayOfMonth}
            </Text>
            {monthOfYear && (
              <Text
                variant="heading"
                style={styles.secondaryDay}
                importantForAccessibility="no"
              >
                {monthOfYear}
              </Text>
            )}
            {year && (
              <Text
                variant="heading"
                style={styles.secondaryDay}
                importantForAccessibility="no"
              >
                {year}
              </Text>
            )}
          </View>
        )}
      </Col>
      <Col flex={1}>
        {!agendaDay.items.length ? (
          isEmptyWeek ? (
            <EmptyWeek />
          ) : (
            <EmptyDay />
          )
        ) : (
          agendaDay.items.map(item => {
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
