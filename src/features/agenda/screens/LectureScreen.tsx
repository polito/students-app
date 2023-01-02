import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { useOrientationChange } from 'react-native-orientation-locker';

import { VideoPlayer } from '@lib/ui/components/VideoPlayer';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { Lecture } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourseVideolectures } from '../../../core/queries/courseHooks';
import { useGetLectures } from '../../../core/queries/lectureHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Lecture'>;

export const LectureScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const lectureQuery = useGetLectures();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);
  const { fontSizes } = useTheme();
  const lecture: Lecture = lectureQuery?.data?.data.find(l => l.id === id);
  const teacherQuery = useGetPerson(lecture?.teacherId);
  const videoLecturesQuery = useGetCourseVideolectures(lecture?.courseId);
  const videoLecture = videoLecturesQuery.data?.data.find(l => l.id === id);
  const [showLecturesInfo, setShowLectureInfo] = useState(true);
  const live = true;

  useOrientationChange(o => {
    const orientation = o as string;
    if (orientation === 'LANDSCAPE-LEFT') {
      setShowLectureInfo(() => false);
    } else {
      setShowLectureInfo(() => true);
    }
  });

  const onPressLectureLocation = () => {
    console.debug('onPressLectureLocation');
  };

  const onPressTeacherCard = () => {
    console.debug('onPressTeacherCard');
  };

  const onPressMaterialCard = () => {
    // navigation.navigate({
    //   name: 'LectureCourseDirectory',
    //   params: {
    //     lectureId: lecture.id,
    //     courseId: lecture.courseId,
    //   },
    // });
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: showLecturesInfo
            ? bottomBarAwareStyles.paddingBottom + 40
            : 0,
        }}
        style={styles.wrapper}
      >
        <VideoPlayer
          videoUrl="https://lucapezzolla.com/20210525.mp4"
          coverUrl={videoLecture?.coverUrl}
        />
        {/* {showLecturesInfo && ( */}
        {/*   <> */}
        {/*     <Row maxWidth noFlex spaceBetween alignCenter> */}
        {/*       <EventDetails */}
        {/*         title={lecture?.roomName} */}
        {/*         type={t('Lecture')} */}
        {/*         time={lecture.startsAt} */}
        {/*       /> */}
        {/*       {live && ( */}
        {/*         <Row alignEnd noFlex justifyEnd> */}
        {/*           <LiveIndicator showText /> */}
        {/*         </Row> */}
        {/*       )} */}
        {/*     </Row> */}
        {/*     <SectionList> */}
        {/*       <ListItem */}
        {/*         leadingItem={ */}
        {/*           <Icon */}
        {/*             icon={faLocationDot} */}
        {/*             style={styles.iconStyle} */}
        {/*             size={fontSizes['2xl']} */}
        {/*           /> */}
        {/*         } */}
        {/*         title={lecture?.roomName} */}
        {/*         subtitle={'Sede Centrale - piano terra'} */}
        {/*         onPress={onPressLectureLocation} */}
        {/*       /> */}
        {/*       {teacherQuery.data && ( */}
        {/*         <ListItem */}
        {/*           leadingItem={ */}
        {/*             <Icon */}
        {/*               icon={faUser} */}
        {/*               style={styles.iconStyle} */}
        {/*               size={fontSizes['2xl']} */}
        {/*             /> */}
        {/*           } */}
        {/*           title={`${teacherQuery.data?.data?.firstName || ''} ${ */}
        {/*             teacherQuery.data?.data?.lastName || '' */}
        {/*           }`} */}
        {/*           subtitle={t('Teacher Lecture')} */}
        {/*           onPress={onPressTeacherCard} */}
        {/*         /> */}
        {/*       )} */}
        {/*       <ListItem */}
        {/*         leadingItem={ */}
        {/*           <Icon */}
        {/*             icon={faFolderOpen} */}
        {/*             style={styles.iconStyle} */}
        {/*             size={fontSizes['2xl']} */}
        {/*           /> */}
        {/*         } */}
        {/*         title={t('Material')} */}
        {/*         subtitle={t('lectureScreen.goToMaterial')} */}
        {/*         onPress={onPressMaterialCard} */}
        {/*       /> */}
        {/*     </SectionList> */}
        {/*   </> */}
        {/* )} */}
      </ScrollView>
    </>
  );
};

const createStyles = ({ spacing, colors, shapes }: Theme) =>
  StyleSheet.create({
    iconStyle: {
      color: colors.secondaryText,
      marginRight: spacing[2],
    },
    sectionSeparator: {
      paddingHorizontal: shapes.lg,
      marginTop: shapes.md / 2,
    },
    sectionContainer: {
      paddingHorizontal: shapes.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      // marginTop: size.xs,
      // padding: size.sm,
    },
    booking: {
      color: colors.primary[400],
      textTransform: 'uppercase',
      marginVertical: shapes.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
