import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Swiper } from '@lib/ui/components/Swiper';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { VirtualClassroom } from '@polito/api-client/models/VirtualClassroom';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer.tsx';
import { EventDetails } from '../../../core/components/EventDetails.tsx';
import { VideoPlayer } from '../../../core/components/VideoPlayer';
import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { convertMachineDateToFormatDate } from '../../../utils/dates.ts';
import { CourseIcon } from '../../courses/components/CourseIcon';
import { isLiveVC, isRecordedVC } from '../../courses/utils/lectures';
import { resolvePlaceId } from '../../places/utils/resolvePlaceId';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Lecture'>;

export const LectureScreen = ({ route, navigation }: Props) => {
  const { item: lecture } = route.params;
  const associatedVirtualClassrooms = lecture.virtualClassrooms;
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const teacherQuery = useGetPerson(lecture.teacherId);
  const { data: virtualClassrooms } = useGetCourseVirtualClassrooms(
    lecture.courseId,
  );
  const [currentIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>();

  const handleSetCurrentPageIndex = (newIndex: number) => {
    setCurrentVideoIndex(newIndex);
  };

  const toggleFullScreen = (value: boolean) => {
    setIsFullScreen(value);
  };

  const [width, setWidth] = useState(Dimensions.get('screen').width);
  const [height, setHeight] = useState(Dimensions.get('screen').height);
  useEffect(() => {
    const updateDimensions = () => {
      const { width: newWidth, height: newHeight } = Dimensions.get('screen');
      setWidth(newWidth);
      setHeight(newHeight);
    };
    Dimensions.addEventListener('change', updateDimensions);
  }, []);

  const renderItem = ({
    item,
    index,
  }: ListRenderItemInfo<VirtualClassroom>) => {
    return (
      <View
        style={{
          width: isFullScreen ? width : Dimensions.get('window').width,
          height: isFullScreen ? height : undefined,
          display: isFullScreen && index !== currentIndex ? 'none' : 'flex',
        }}
      >
        <VideoPlayer
          source={{ uri: item.videoUrl }}
          poster={item.coverUrl ?? undefined}
          toggleFullScreen={toggleFullScreen}
          currentIndex={currentIndex}
          index={index}
        />
      </View>
    );
  };

  const [playingVC, setPlayingVC] = useState<VirtualClassroom[]>([]);

  useEffect(() => {
    if (!associatedVirtualClassrooms || !virtualClassrooms) return;

    setCurrentVideoTitle(associatedVirtualClassrooms[currentIndex]?.title);
    setPlayingVC(
      associatedVirtualClassrooms
        .map(vc => {
          const apiVC = virtualClassrooms.find(vcs => vcs.id === vc.id);

          return apiVC as VirtualClassroom;
        })
        .filter(vc => vc && vc?.videoUrl),
    );
  }, [associatedVirtualClassrooms, currentIndex, virtualClassrooms]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={GlobalStyles.fillHeight}
      scrollEnabled={!isFullScreen}
    >
      <SafeAreaView>
        {playingVC.length === 1 && isRecordedVC(playingVC[0]) && (
          <VideoPlayer
            source={{ uri: playingVC[0]?.videoUrl }}
            poster={playingVC[0]?.coverUrl ?? undefined}
          />
        )}
        {playingVC.length > 1 && (
          <View
            style={{
              height: isFullScreen ? '100%' : 'auto',
              width: isFullScreen ? '100%' : 'auto',
            }}
          >
            <Swiper
              isFullScreen={isFullScreen}
              items={playingVC}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              onIndexChanged={handleSetCurrentPageIndex}
            />
          </View>
        )}

        {isLiveVC(playingVC) && (
          <View></View>
          // TODO handle live VC
          // <CtaButton title={t('courseVirtualClassroomScreen.liveCta')} action={Linking.openURL(lecture.)}/>
        )}
        <EventDetails
          title={currentVideoTitle ?? lecture.title}
          type={t('common.lecture')}
          time={`${convertMachineDateToFormatDate(lecture.date)} ${
            lecture.fromTime
          } - ${lecture.toTime}`}
        />
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
