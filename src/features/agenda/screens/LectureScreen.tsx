import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Row } from '@lib/ui/components/Row';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { VideoPlayer } from '../../../core/components/VideoPlayer';
import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { convertMachineDateToFormatDate } from '../../../utils/dates';
import { CourseIcon } from '../../teaching/components/CourseIcon';
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
    const vcId = [...lecture.virtualClassrooms].shift()!.id;
    if (!vcId) return;

    return virtualClassrooms.find(vcs => vcs.id === vcId);
  }, [lecture.virtualClassrooms, virtualClassrooms]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={GlobalStyles.fillHeight}
    >
      {virtualClassroom?.videoUrl && (
        <VideoPlayer
          source={{ uri: virtualClassroom?.videoUrl }}
          poster={virtualClassroom?.coverUrl ?? undefined}
        />
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
      <SectionList indented>
        {lecture?.place && (
          <ListItem
            leadingItem={<Icon icon={faLocationDot} size={fontSizes['2xl']} />}
            title={lecture.place.name}
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
          leadingItem={<CourseIcon icon={lecture.icon} color={lecture.color} />}
          disabled
          // linkTo={{
          //   screen: 'LectureCourseDirectory',
          //   params: {
          //     lectureId: lecture.id,
          //     courseId: lecture.courseId,
          //   },
          // }}
        />
      </SectionList>
    </ScrollView>
  );
};
