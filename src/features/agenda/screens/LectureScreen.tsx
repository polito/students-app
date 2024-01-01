import { useMemo } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, View } from 'react-native';
import Swiper from 'react-native-swiper';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Row } from '@lib/ui/components/Row';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { EventDetails } from '../../../core/components/EventDetails';
import { VideoPlayer } from '../../../core/components/VideoPlayer';
import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { convertMachineDateToFormatDate } from '../../../utils/dates';
import { CourseIcon } from '../../courses/components/CourseIcon';
import {
  isLiveVC,
  isRecordedVC,
  isVideoLecture,
} from '../../courses/utils/lectures';
import { resolvePlaceId } from '../../places/utils/resolvePlaceId';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Lecture'>;

export const LectureScreen = ({ route, navigation }: Props) => {
  const { item: lecture } = route.params;
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const associatedVirtualClassrooms = lecture.virtualClassrooms;
  const { t } = useTranslation();
  const { fontSizes, spacing } = useTheme();
  const teacherQuery = useGetPerson(lecture.teacherId);
  const { data: virtualClassroomsQuery } = useGetCourseVirtualClassrooms(
    lecture.courseId,
  );

  const virtualClassroomRet = useMemo(() => {
    if (associatedVirtualClassrooms.length === 0) return [];
    return associatedVirtualClassrooms.map(vc =>
      virtualClassroomsQuery?.find(vcs => vcs.id === vc.id),
    );
  }, [associatedVirtualClassrooms, virtualClassroomsQuery]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={GlobalStyles.fillHeight}
    >
      <SafeAreaView>
        {virtualClassroomRet && virtualClassroomRet.length > 0 && (
          <Swiper
            style={{ height: spacing[72] }}
            showsPagination={true}
            loop={false}
            index={currentVideoIndex}
            onIndexChanged={index => {
              setCurrentVideoIndex(index);
            }}
          >
            {virtualClassroomRet.map(vc => {
              if (
                vc &&
                (isRecordedVC(vc) || isVideoLecture(vc)) &&
                vc.videoUrl
              ) {
                return (
                  <View key={vc.id}>
                    <VideoPlayer
                      source={{ uri: vc.videoUrl }}
                      poster={vc.coverUrl ?? undefined}
                    />
                  </View>
                );
              }
            })}
          </Swiper>
        )}

        {virtualClassroomRet && isLiveVC(virtualClassroomRet) && (
          <View></View>
          // TODO handle live VC
          // <CtaButton title={t('courseVirtualClassroomScreen.liveCta')} action={Linking.openURL(lecture.)}/>
        )}
        <Row justify="space-between" align="center">
          <EventDetails
            title={
              virtualClassroomRet[currentVideoIndex]?.title ?? lecture.title
            }
            type={t('common.lecture')}
            time={`${convertMachineDateToFormatDate(lecture.date)} ${
              lecture.fromTime
            } - ${lecture.toTime}`}
          />
        </Row>
        <OverviewList indented>
          {lecture?.place && (
            <ListItem
              leadingItem={
                <Icon icon={faLocationDot} size={fontSizes['2xl']} />
              }
              title={
                lecture.place?.name
                  ? t('agendaScreen.room', { roomName: lecture.place.name })
                  : '-'
              }
              isAction
              onPress={() => {
                navigation.navigate('PlacesAgendaStack', {
                  screen: 'Place',
                  params: {
                    placeId: resolvePlaceId(lecture.place!),
                    isCrossNavigation: true,
                  },
                });
              }}
            />
          )}
          {teacherQuery.data && (
            <PersonListItem
              person={teacherQuery.data}
              subtitle={t('common.teacher')}
            />
          )}
          <ListItem
            title={lecture.title}
            subtitle={t('lectureScreen.courseFilesCta')}
            leadingItem={
              <CourseIcon icon={lecture.icon} color={lecture.color} />
            }
            linkTo={{
              screen: 'Course',
              params: {
                screen: 'CourseFilesScreen',
                id: lecture.courseId,
              },
            }}
          />
        </OverviewList>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
