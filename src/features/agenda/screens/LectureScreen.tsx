import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, View } from 'react-native';

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
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { convertMachineDateToFormatDate } from '../../../utils/dates';
import { CourseIcon } from '../../teaching/components/CourseIcon';
import {
  isLiveVC,
  isRecordedVC,
  isVideoLecture,
} from '../../teaching/utils/lectures';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Lecture'>;

export const LectureScreen = ({ route }: Props) => {
  const { item: lecture } = route.params;
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const teacherQuery = useGetPerson(lecture.teacherId);
  const { data: virtualClassrooms } = useGetCourseVirtualClassrooms(
    lecture.courseId,
  );
  const virtualClassroom = useMemo(() => {
    if (lecture.virtualClassrooms.length > 0 || !virtualClassrooms) return;

    // Temporary behaviour until multiple videos in 1 screen are managed
    const vc = [...lecture.virtualClassrooms].shift();
    if (!vc) return;

    return virtualClassrooms.find(vcs => vcs.id === vc.id);
  }, [lecture.virtualClassrooms, virtualClassrooms]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={GlobalStyles.fillHeight}
    >
      <SafeAreaView>
        {lecture &&
          (isRecordedVC(lecture) || isVideoLecture(lecture)) &&
          lecture.videoUrl && (
            <VideoPlayer
              source={{ uri: lecture.videoUrl }}
              poster={lecture?.coverUrl ?? undefined}
            />
          )}
        {lecture && isLiveVC(lecture) && (
          <View></View>
          // TODO handle live VC
          // <CtaButton title={t('courseVirtualClassroomScreen.liveCta')} action={Linking.openURL(lecture.)}/>
        )}
        <Row justify="space-between" align="center">
          <EventDetails
            title={virtualClassroom?.title ?? lecture.title}
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
              title={lecture.place.name}
            />
          )}
          {teacherQuery.data && (
            <PersonListItem
              person={teacherQuery.data}
              subtitle={t('common.teacher')}
              isCrossNavigation={true}
            />
          )}
          <ListItem
            title={lecture.title}
            subtitle={t('lectureScreen.courseFilesCta')}
            leadingItem={
              <CourseIcon icon={lecture.icon} color={lecture.color} />
            }
            disabled
            // linkTo={{
            //   screen: 'LectureCourseDirectory',
            //   params: {
            //     lectureId: lecture.id,
            //     courseId: lecture.courseId,
            //   },
            // }}
          />
        </OverviewList>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
