import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { Deadline, Lecture } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DateTime } from 'luxon';

import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';
import { isLive } from '../../../src/utils';
import { AgendaItemInterface } from '../../../src/utils/types';
import { useTheme } from '../hooks/useTheme';
import { Card, Props as CardProps } from './Card';
import { LiveIndicator } from './LiveIndicator';
import { Text } from './Text';

interface Props {
  item: AgendaItemInterface;
}

export const AgendaCard = ({
  item,
  ...rest
}: PropsWithChildren<CardProps & Props>) => {
  const { t } = useTranslation();
  const preferences = usePreferencesContext();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const isLecture = item.type === 'Lecture';
  const live = useMemo(() => {
    if (!isLecture) return false;
    const lecture = item.content as Lecture;
    return isLive(lecture.startsAt, lecture.endsAt);
  }, []);
  const fromHour = DateTime.fromISO(item.fromDate).toFormat('HH:mm');
  const toHour = DateTime.fromISO(item.toDate).toFormat('HH:mm');
  const time = `${fromHour} - ${toHour}`;
  const borderColor = useMemo(() => {
    if (isLecture) {
      const lecture = item.content as Lecture;
      return preferences.courses[lecture.courseId].color;
    }
    return preferences.types[item.type]?.color || colors.primary[500];
  }, [item]);

  const onPressCard = (): void => {
    console.log('item', item);

    if (item.type === 'Deadline') {
      const deadline: Deadline = item.content as Deadline;
      navigation.navigate({
        name: item.type,
        params: {
          type: deadline.type,
          date: deadline?.endsAt ? deadline.endsAt.toISOString() : null,
        },
      });
      return;
    }

    if (item.type === 'Lecture') {
      const lecture = item.content as Lecture;
      console.log('lecture', lecture);

      // if (lecture.roomName === 'AULA VIRTUALE') {
      //   console.log('go to virtual classroom');
      //   navigation.navigate({
      //     name: 'CourseVirtualClassroom',
      //     params: {
      //       lectureId: lecture.id,
      //       courseId: lecture.courseId,
      //     },
      //   });
      //   return;
      // } else {
      navigation.navigate({
        name: 'Lecture',
        params: {
          id: lecture.id,
        },
      });
      // }
      // return;
    }

    navigation.navigate({
      name: item.type,
      params: {
        id: item.content?.id,
      },
    });

    // if (item.type === 'Lecture') {
    //   const lecture = item.content as Lecture;
    //   const virtualClassroom = useGetCourseVirtualClassrooms(lecture.courseId);
    //
    //   console.log('virtualClassroom', virtualClassroom);
    //   return;
    // }
  };

  return (
    <Card style={[{ borderColor }, styles.agendaCard]} {...rest}>
      <TouchableOpacity style={styles.agendaButtonStyle} onPress={onPressCard}>
        <Col>
          <Row justifyCenter alignCenter spaceBetween noFlex maxWidth>
            <Text
              weight={'semibold'}
              numberOfLines={1}
              variant={'secondaryText'}
              style={styles.title}
            >
              {item.title}
            </Text>
            <Row noFlex justifyCenter alignCenter>
              {live && <LiveIndicator />}
              <Text variant="secondaryText" style={{ fontSize: fontSizes.xs }}>
                {time}
              </Text>
            </Row>
          </Row>
          <Row
            justifyCenter
            alignCenter
            spaceBetween
            noFlex
            maxWidth
            style={styles.rowBottom}
          >
            <Col alignCenter noFlex justifyCenter style={styles.itemType}>
              <Text style={styles.textType} variant={'prose'}>
                {t(item.type)}
              </Text>
            </Col>
            <Text weight={'medium'}>{item.classroom}</Text>
          </Row>
        </Col>
      </TouchableOpacity>
    </Card>
  );
};

const createStyles = ({ spacing, colors, size, fontSizes }: Theme) =>
  StyleSheet.create({
    rowBottom: {
      marginTop: size.sm,
    },
    itemType: {
      borderRadius: size.xs,
      paddingHorizontal: spacing[1.5],
      paddingTop: size.xs,
      borderColor: colors.primary[600],
      borderWidth: 1,
    },
    textType: {
      fontSize: 12,
    },
    title: {
      maxWidth: '50%',
      color: colors.title,
      fontSize: fontSizes.lg,
    },
    agendaCard: {
      flex: 1,
      width: '100%',
      borderWidth: 3,
      marginTop: spacing['2'],
    },
    agendaButtonStyle: {
      padding: spacing[4],
      paddingBottom: spacing[3],
    },
  });
