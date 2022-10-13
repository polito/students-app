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

  const [sections, setSections] = useState([]);
  const [lectures, setLectures] = useState([]);

  const [loadedSectionsCount, setLoadedSectionsCount] = useState(0);

  const onSectionLoaded = () => setLoadedSectionsCount(c => ++c);
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

    onSectionLoaded();
  }, [virtualClassroomsQuery.isLoading]);

  useEffect(() => {
    if (videolecturesQuery.isLoading) return;

    if (!videolecturesQuery.data.data) {
      onSectionLoaded();
      return;
    }

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

    onSectionLoaded();
  }, [videolecturesQuery.isLoading]);

  useEffect(() => {
    if (courseQuery.isLoading || areRelatedLoading) return;

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

    onSectionLoaded();
  }, [courseQuery.isLoading, areRelatedLoading]);

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
    loadedSectionsCount === 3 && (
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
                  <Icon
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
