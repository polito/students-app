import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { ListItem } from '@lib/ui/components/ListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { Lecture } from '@polito-it/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import _ from 'lodash';

import { EventDetails } from '../../../core/components/EventDetails';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useGetCourse,
  useGetCourseVirtualClassrooms,
} from '../../../core/queries/courseHooks';
import { useGetLectures } from '../../../core/queries/lectureHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { fromDateToFormat, weekDay } from '../../../utils';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Lecture'>;

export const LectureScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  console.log('LectureId', id);
  const { t } = useTranslation();
  const lectureQuery = useGetLectures();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);
  const { colors, fontSizes, spacing } = useTheme();
  const lecture: Lecture = _.find(lectureQuery?.data?.data, l => l.id === id);
  const coursesQuery = useGetCourse(lecture.courseId);
  const teacherQuery = useGetPerson(lecture.teacherId);
  const virtualClassroomQuery = useGetCourseVirtualClassrooms(lecture.courseId);

  console.log('virtualClassroomQuery', virtualClassroomQuery?.data);
  console.log('courseQuery', coursesQuery?.data);
  console.log('teacherQuery', teacherQuery?.data);
  console.log('lecture', lecture);

  const timeLabel = useMemo(() => {
    const endsAtDate = fromDateToFormat(lecture?.endsAt);
    const day = lecture?.endsAt ? `${weekDay(lecture.endsAt, t)}, ` : '';

    return `${day}  ${endsAtDate}`;
  }, [lecture]);

  const onPressLectureLocation = () => {
    console.log('onPressLectureLocation');
  };

  const onPressTeacherCard = () => {
    console.log('onPressTeacherCard');
  };

  const onPressMaterialCard = () => {
    navigation.navigate({
      name: 'LectureCourseDirectory',
      params: {
        lectureId: lecture.id,
        courseId: lecture.courseId,
      },
    });
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: bottomBarAwareStyles.paddingBottom + 40,
        }}
        style={styles.wrapper}
      >
        <EventDetails
          title={lecture.roomName}
          type={t('Lecture')}
          timeLabel={timeLabel}
        />
        <SectionList>
          <ListItem
            leadingItem={
              <Icon
                name="location"
                style={styles.iconStyle}
                size={fontSizes['2xl']}
              />
            }
            title={lecture.roomName}
            subtitle={'Sede Centrale - piano terra'}
            onPress={onPressLectureLocation}
          />
          {teacherQuery.data && (
            <ListItem
              leadingItem={
                <Icon
                  name="person-outline"
                  style={styles.iconStyle}
                  size={fontSizes['2xl']}
                />
              }
              title={`${teacherQuery.data?.data?.firstName || ''} ${
                teacherQuery.data?.data?.lastName || ''
              }`}
              subtitle={t('Teacher Lecture')}
              onPress={onPressTeacherCard}
            />
          )}
          <ListItem
            leadingItem={
              <Icon
                name="ios-folder-outline"
                style={styles.iconStyle}
                size={fontSizes['2xl']}
              />
            }
            title={t('Material')}
            subtitle={t('GoToCourseMaterial')}
            onPress={onPressMaterialCard}
          />
        </SectionList>
      </ScrollView>
    </>
  );
};

const createStyles = ({ spacing, colors, size }: Theme) =>
  StyleSheet.create({
    iconStyle: {
      color: colors.secondaryText,
      marginRight: spacing[2],
    },
    sectionSeparator: {
      paddingHorizontal: size.lg,
      marginTop: size.xs,
    },
    sectionContainer: {
      paddingHorizontal: size.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      marginTop: size.xs,
      // padding: size.sm,
    },
    booking: {
      color: colors.primary[400],
      textTransform: 'uppercase',
      marginVertical: size.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
