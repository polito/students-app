import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { TouchableCard } from '@lib/ui/components/TouchableCard';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { VideoLecture, VirtualClassroom } from '@polito-it/api-client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TranslucentView } from '../../../core/components/TranslucentView';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import {
  useGetCourse,
  useGetCourseRelatedVirtualClassrooms,
  useGetCourseVideolectures,
  useGetCourseVirtualClassrooms,
} from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { CourseTabProps } from '../screens/CourseScreen';
import { TeachingStackParamList } from './TeachingNavigator';

export const CourseLecturesTab = ({ courseId, navigation }: CourseTabProps) => {
  const { t } = useTranslation();
  const { spacing, colors, fontSizes } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollPosition = useRef(new Animated.Value(0));
  const courseQuery = useGetCourse(courseId);
  const videolecturesQuery = useGetCourseVideolectures(courseId);
  const virtualClassroomsQuery = useGetCourseVirtualClassrooms(courseId);

  const vcPreviousYears = courseQuery.data?.data.vcPreviousYears;
  const vcOtherCourses = courseQuery.data?.data.vcOtherCourses;

  const { queries: relatedVCQueries, isLoading: areRelatedLoading } =
    useGetCourseRelatedVirtualClassrooms(vcPreviousYears, vcOtherCourses);

  const queries = [
    courseQuery,
    videolecturesQuery,
    virtualClassroomsQuery,
    ...relatedVCQueries,
  ];

  const [sections, setSections] = useState([]);
  const [lectures, setLectures] = useState([]);

  const isSomethingLoaded = useRef(false);
  const sectionListRef = useRef(null);

  useEffect(() => {
    if (virtualClassroomsQuery.isLoading) return;

    setLectures(oldL => {
      oldL[0] = virtualClassroomsQuery.data.data;
      return oldL;
    });

    setSections(oldS => {
      oldS[0] = {
        index: 0,
        title: t('Virtual classrooms'),
        data: virtualClassroomsQuery.data.data,
        type: 'VirtualClassroom',
        isExpanded: true,
      };

      return oldS;
    });

    isSomethingLoaded.current = true;
  }, [virtualClassroomsQuery.isLoading]);

  useEffect(() => {
    if (videolecturesQuery.isLoading) return;

    if (!videolecturesQuery.data.data.length) return;

    setLectures(oldL => {
      oldL[1] = videolecturesQuery.data.data;
      return oldL;
    });

    setSections(oldS => {
      oldS[1] = {
        index: 1,
        title: t('Video lectures'),
        data: [],
        type: 'VideoLecture',
        isExpanded: false,
      };

      return oldS;
    });
  }, [videolecturesQuery.isLoading]);

  useEffect(() => {
    if (areRelatedLoading) return;

    setLectures(oldL => {
      relatedVCQueries.forEach((relatedQuery, index) => {
        oldL[2 + index] = relatedQuery.data.data;
      });
      return oldL;
    });

    setSections(oldS => {
      const sectionTitles = vcPreviousYears
        .map(py => `${t('Virtual classrooms')} - ${py.year}`)
        .concat(vcOtherCourses.map(oc => `${oc.name} ${oc.year}`));

      sectionTitles.forEach((title, index) => {
        oldS[2 + index] = {
          index: 2 + index,
          title,
          data: [],
          type: 'VirtualClassroom',
          isExpanded: false,
        };
      });

      return oldS;
    });
  }, [areRelatedLoading]);

  const toggleSection = index => {
    setSections(oldS => {
      const wasSectionCollapsed = !oldS[index].isExpanded;

      oldS = oldS.map(s => {
        s.data = [];
        s.isExpanded = false;
        return s;
      });
      if (wasSectionCollapsed) {
        oldS[index].data = lectures[index];
        oldS[index].isExpanded = true;
        sectionListRef.current.scrollToLocation({
          itemIndex: 0,
        });
      }
      return oldS;
    });
  };

  return (
    isSomethingLoaded.current && (
      <SectionList
        ref={sectionListRef}
        contentContainerStyle={bottomBarAwareStyles}
        sections={sections}
        refreshing={queries.some(q => q.isLoading)}
        onRefresh={() => queries.forEach(q => q.refetch())}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollPosition.current } } }],
          { useNativeDriver: false },
        )}
        ItemSeparatorComponent={IndentedDivider}
        renderSectionHeader={({ section: { title, index } }) => (
          <Pressable onPress={() => toggleSection(index)}>
            <View
              style={{
                paddingVertical: spacing[2],
              }}
            >
              <TranslucentView
                style={{
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.divider,
                }}
              />
              <SectionHeader
                title={title}
                separator={false}
                trailingItem={
                  <Ionicons
                    name={
                      sections[index].isExpanded
                        ? 'chevron-up-outline'
                        : 'chevron-down-outline'
                    }
                    color={colors.secondaryText}
                    size={fontSizes['2xl']}
                  />
                }
              />
            </View>
          </Pressable>
        )}
        renderItem={({ section, item: lecture }) => {
          const { data: teacher } = useGetPerson(lecture.teacherId);
          return (
            <ListItem
              title={lecture.title}
              subtitle={[
                teacher && `${teacher.data.firstName} ${teacher.data.lastName}`,
                lecture.createdAt?.toLocaleDateString(),
                lecture.duration,
              ]
                .filter(i => !!i)
                .join(' - ')}
              linkTo={{
                screen:
                  section.type === 'VideoLecture'
                    ? 'CourseVideolecture'
                    : 'CourseVirtualClassroom',
                params: { courseId, lectureId: lecture.id },
              }}
            />
          );
        }}
      />
    )
  );
};

interface CourseLectureProps {
  navigation?: NativeStackNavigationProp<TeachingStackParamList, 'Course'>;
  lecture: VideoLecture | VirtualClassroom;
  courseId: number;
  type: string;
}

const CourseLectureCard = ({
  navigation,
  lecture,
  courseId,
  type,
}: CourseLectureProps) => {
  const { spacing } = useTheme();

  const { data: teacher } = useGetPerson(`${lecture.teacherId}`);

  return (
    <TouchableCard
      key={lecture.id}
      style={{ marginBottom: spacing[4] }}
      cardStyle={{ padding: spacing[5] }}
      onPress={() =>
        navigation.navigate({
          name:
            type === 'VideoLecture'
              ? 'CourseVideolecture'
              : 'CourseVirtualClassroom',
          params: { courseId, lectureId: lecture.id },
        })
      }
    >
      <View style={{ marginBottom: spacing[2] }}>
        <Text variant="headline" numberOfLines={1} ellipsizeMode="tail">
          {lecture.title}
        </Text>
        <Text variant="secondaryText">
          {teacher && `${teacher.data.firstName} ${teacher.data.lastName}`}
        </Text>
      </View>
      <Text variant="secondaryText">
        {lecture.createdAt?.toLocaleDateString()} - {lecture.duration}
      </Text>
    </TouchableCard>
  );
};
