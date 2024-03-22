import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Row } from '@lib/ui/components/Row';
import { Swiper } from '@lib/ui/components/Swiper';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { VirtualClassroom } from '@polito/api-client/models/VirtualClassroom';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DateTime, WeekdayNumbers } from 'luxon';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { EventDetails } from '../../../core/components/EventDetails';
import { VideoPlayer } from '../../../core/components/VideoPlayer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useGetCourseVirtualClassrooms } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { convertMachineDateToFormatDate } from '../../../utils/dates';
import { CourseIcon } from '../../courses/components/CourseIcon';
import { isLiveVC, isRecordedVC } from '../../courses/utils/lectures';
import { resolvePlaceId } from '../../places/utils/resolvePlaceId';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Lecture'>;

export const LectureScreen = ({ route, navigation }: Props) => {
  const { item: lecture } = route.params;
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const associatedVirtualClassrooms = lecture.virtualClassrooms;
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const teacherQuery = useGetPerson(lecture.teacherId);
  const { data: virtualClassroomsQuery } = useGetCourseVirtualClassrooms(
    lecture.courseId,
  );
  const { courses: coursesPrefs, updatePreference } = usePreferencesContext();

  const coursePrefs = useMemo(() => {
    if (!lecture?.uniqueShortcode) {
      return null;
    }
    return coursesPrefs[lecture?.uniqueShortcode];
  }, [lecture?.uniqueShortcode, coursesPrefs]);

  const { width } = useWindowDimensions();

  const handleSetCurrentPageIndex = (newIndex: number, oldIndex: number) => {
    // setCurrentVideoIndex(newIndex);
    setPlayingVC(oldVC => [
      ...oldVC.map((v, i) => {
        if (i === newIndex) v.isPaused = false;
        if (i === oldIndex) v.isPaused = true;
        return v;
      }),
    ]);
  };
  const renderItem = ({ item }: ListRenderItemInfo<PlayingVC>) => {
    return (
      <View style={{ width }}>
        <VideoPlayer
          source={{ uri: item.videoUrl }}
          poster={item.coverUrl ?? undefined}
          paused={item.isPaused}
        />
      </View>
    );
  };

  type PlayingVC = VirtualClassroom & { isPaused: boolean };

  const [playingVC, setPlayingVC] = useState<PlayingVC[]>([]);

  useEffect(() => {
    if (!associatedVirtualClassrooms || !virtualClassroomsQuery) return;

    setPlayingVC(
      associatedVirtualClassrooms
        .map((vc, index) => {
          const apiVC = virtualClassroomsQuery.find(vcs => vcs.id === vc.id);

          return { ...apiVC, isPaused: index > 0 } as PlayingVC;
        })
        .filter(vc => vc && vc?.videoUrl),
    );
  }, [associatedVirtualClassrooms, virtualClassroomsQuery]);

  const hideEvent = () => {
    Alert.alert(
      t('lectureScreen.hideEventAlertTitle'),
      t('lectureScreen.hideEventAlertMessage', {
        title: lecture.title,
        day: DateTime.now()
          .set({ weekday: lecture.start.weekday as WeekdayNumbers })
          .toFormat('cccc'),
        fromTime: lecture.fromTime,
        toTime: lecture.toTime,
      }),
      [
        { text: t('common.cancel'), onPress: () => {} },
        {
          text: t('common.ok'),
          onPress: () => {
            changeEventVisibility();
          },
        },
      ],
      { cancelable: false },
    );
  };

  const changeEventVisibility = () => {
    if (!lecture.uniqueShortcode || !coursePrefs) {
      return;
    }
    updatePreference('courses', {
      ...coursesPrefs,
      [lecture?.uniqueShortcode]: {
        ...coursePrefs,
        itemsToHideInAgenda: [
          ...(coursePrefs.itemsToHideInAgenda || []),
          {
            start: lecture.fromTime,
            end: lecture.toTime,
            day: lecture.start.weekday,
            room: lecture.place ? resolvePlaceId(lecture.place) : '',
          },
        ],
      },
    });
    navigation.pop();
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={GlobalStyles.fillHeight}
      >
        <SafeAreaView>
          {playingVC[0] &&
            playingVC.length === 1 &&
            isRecordedVC(playingVC[0]) && (
              <VideoPlayer
                source={{ uri: playingVC[0]?.videoUrl }}
                poster={playingVC[0]?.coverUrl ?? undefined}
              />
            )}
          {playingVC && playingVC.length > 1 && (
            <Swiper
              items={playingVC}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              onIndexChanged={handleSetCurrentPageIndex}
            />
          )}

          {playingVC && isLiveVC(playingVC) && (
            <View></View>
            // TODO handle live VC
            // <CtaButton title={t('courseVirtualClassroomScreen.liveCta')} action={Linking.openURL(lecture.)}/>
          )}
          <Row justify="space-between" align="center">
            <EventDetails
              title={playingVC[currentVideoIndex]?.title ?? lecture.title}
              type={`${t('common.lecture')} ${lecture.description ? '- ' + lecture.description : ''}`}
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
      <CtaButtonContainer absolute>
        <CtaButton
          title={t('lectureScreen.hideEventButtonTitle')}
          action={hideEvent}
          destructive
          absolute={false}
          containerStyle={{ paddingVertical: 0 }}
        />
      </CtaButtonContainer>
    </>
  );
};
