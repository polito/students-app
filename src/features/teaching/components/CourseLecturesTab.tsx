import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { VideoLecture } from '@polito-it/api-client';
import { GetCourseVirtualClassrooms200ResponseDataInner } from '@polito-it/api-client/models/GetCourseVirtualClassrooms200ResponseDataInner';

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

type SectionLectures =
  | GetCourseVirtualClassrooms200ResponseDataInner[]
  | VideoLecture[];

interface Section {
  index: number;
  title: string;
  data: SectionLectures;
  type: 'VirtualClassroom' | 'VideoLecture';
  isExpanded: boolean;
}

export const CourseLecturesTab = ({ courseId }: CourseTabProps) => {
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

  const [sections, setSections] = useState<Section[]>([]);
  const [lectures, setLectures] = useState<SectionLectures[]>([]);

  const [loadedLectureQueriesCount, setLoadedLectureQueriesCount] = useState(0);
  const onLectureQueryLoaded = () => setLoadedLectureQueriesCount(c => ++c);

  const setSectionLectures = (
    sectionIndex: number,
    sectionLectures: SectionLectures,
  ) =>
    setLectures(oldL =>
      Object.assign([], oldL, { [sectionIndex]: sectionLectures }),
    );

  const sectionListRef = useRef(null);

  useEffect(() => {
    if (virtualClassroomsQuery.isLoading) return;

    if (virtualClassroomsQuery.data.data) {
      setSectionLectures(0, virtualClassroomsQuery.data.data);
    }
    onLectureQueryLoaded();
  }, [virtualClassroomsQuery.isLoading]);

  useEffect(() => {
    if (videolecturesQuery.isLoading) return;

    if (videolecturesQuery.data.data) {
      setSectionLectures(1, videolecturesQuery.data.data);
    }
    onLectureQueryLoaded();
  }, [videolecturesQuery.isLoading]);

  useEffect(() => {
    if (courseQuery.isLoading || areRelatedLoading) return;

    relatedVCQueries.forEach((relatedQuery, index) => {
      if (relatedQuery.data.data) {
        setSectionLectures(2 + index, relatedQuery.data.data);
      }
    });

    onLectureQueryLoaded();
  }, [courseQuery.isLoading, areRelatedLoading]);

  // After all lectures have been retrieve, only render sections containing lectures (the first one should be open)
  useEffect(() => {
    if (loadedLectureQueriesCount < 3) return;

    const availableSections: Section[] = [
      {
        index: 0,
        title: t('Virtual classrooms'),
        data: [],
        type: 'VirtualClassroom',
        isExpanded: false,
      },
      {
        index: 1,
        title: t('Video lectures'),
        data: [],
        type: 'VideoLecture',
        isExpanded: false,
      },
    ];

    const sectionTitles = vcPreviousYears
      .map(py => `${t('Virtual classrooms')} - ${py.year}`)
      .concat(vcOtherCourses.map(oc => `${oc.name} ${oc.year}`));

    sectionTitles.forEach((title, index) => {
      availableSections[2 + index] = {
        index: 2 + index,
        title,
        data: [],
        type: 'VirtualClassroom',
        isExpanded: false,
      };
    });

    const renderedSections: Section[] = [];
    let shouldExpand = true;
    availableSections.forEach(section => {
      if (section.index in lectures) {
        renderedSections.push({
          ...section,
          isExpanded: shouldExpand,
          data: shouldExpand ? lectures[section.index] : [],
        });

        if (shouldExpand) shouldExpand = false;
      }
    });

    setSections(renderedSections);
  }, [loadedLectureQueriesCount]);

  const toggleSection = (index: number) => {
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
      return [...oldS];
    });
  };

  return (
    sections.length > 0 && (
      <SectionList
        ref={sectionListRef}
        contentContainerStyle={bottomBarAwareStyles}
        sections={sections}
        refreshing={queries.some(q => q.isLoading)}
        onRefresh={() => queries.forEach(q => q.refetch())}
        stickySectionHeadersEnabled={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollPosition.current } } }],
          { useNativeDriver: false },
        )}
        ItemSeparatorComponent={IndentedDivider}
        renderSectionHeader={({ section: { title, index, isExpanded } }) => (
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
                  <Icon
                    name={
                      isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'
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
