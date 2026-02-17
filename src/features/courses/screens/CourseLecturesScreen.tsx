import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  SectionList,
  SectionListData,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  faChalkboardTeacher,
  faChevronDown,
  faChevronUp,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useFocusEffect } from '@react-navigation/native';

import _ from 'lodash';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { TranslucentView } from '../../../core/components/TranslucentView';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useGetCourseLectures } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { formatDate } from '../../../utils/dates';
import { useCourseContext } from '../contexts/CourseContext';
import {
  CourseLecture,
  CourseLectureSection,
} from '../types/CourseLectureSections';
import { isRecordedVC, isVideoLecture } from '../utils/lectures';

export const CourseLecturesScreen = () => {
  const { t } = useTranslation();
  const safeAreaInsets = useSafeAreaInsets();
  const courseId = useCourseContext();
  const { spacing, colors } = useTheme();
  const scrollPosition = useRef(new Animated.Value(0));
  const courseLecturesQuery = useGetCourseLectures(courseId);
  const { clearNotificationScope } = useNotifications();
  const [lectures, setLectures] = useState<CourseLectureSection[]>([]);
  const sectionListRef =
    useRef<SectionList<CourseLecture, CourseLectureSection>>(null);
  const isCacheMissing = useOfflineDisabled(
    () => courseLecturesQuery.data === undefined,
  );

  useFocusEffect(
    useCallback(() => {
      clearNotificationScope([
        'teaching',
        'courses',
        courseId.toString(),
        'lectures',
      ]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (!courseLecturesQuery.data) return;

    const nextLectures = [...courseLecturesQuery.data];
    setLectures(prev => {
      const isFirstRender = !prev.length;
      return nextLectures.map((section, index) => {
        if (isFirstRender) {
          if (index === 0) {
            return { ...section, isExpanded: true };
          }
        } else if (prev?.[index]?.isExpanded) {
          return { ...section, isExpanded: true };
        }

        return { ...section, isExpanded: false, data: [] };
      });
    });
  }, [courseLecturesQuery.isLoading, courseLecturesQuery.data]);

  const toggleSection = (sectionTitle: string) => {
    setLectures(oldS => {
      return oldS.map((section, index) => {
        let isExpanded = false;
        let data: unknown = [];
        if (section.title === sectionTitle) {
          isExpanded = !section.isExpanded;
        }

        if (isExpanded && !section.data.length) {
          data = courseLecturesQuery.data?.[index].data ?? [];
        }

        return {
          ...section,
          isExpanded,
          data,
        } as CourseLectureSection;
      });
    });
  };

  useFocusEffect(
    useCallback(() => {
      const hasExpandedWithData = _.some(
        lectures,
        item => item?.isExpanded && item?.data?.length > 0,
      );
      const hasAllNoExpanded = _.every(lectures, item => !item?.isExpanded);
      if (
        (!hasExpandedWithData && !hasAllNoExpanded) ||
        lectures?.length === 0
      ) {
        setTimeout(() => {
          AccessibilityInfo.announceForAccessibility(
            t('courseLecturesTab.emptyState'),
          );
        }, 1000);
      }
    }, [lectures, t]),
  );

  return (
    <SectionList
      ref={sectionListRef}
      contentInsetAdjustmentBehavior="automatic"
      sections={lectures}
      refreshControl={<RefreshControl queries={[courseLecturesQuery]} />}
      stickySectionHeadersEnabled={true}
      ListEmptyComponent={() => {
        if (!courseLecturesQuery.isLoading) {
          return (
            <OverviewList emptyStateText={t('courseLecturesTab.emptyState')} />
          );
        } else if (isCacheMissing) {
          return <OverviewList emptyStateText={t('common.cacheMiss')} />;
        }
        return null;
      }}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollPosition.current } } }],
        { useNativeDriver: false },
      )}
      ItemSeparatorComponent={Platform.select({
        ios: () => (
          <IndentedDivider
            indent={safeAreaInsets.left + 56}
            style={{ marginRight: safeAreaInsets.right }}
          />
        ),
      })}
      renderSectionHeader={({ section: { title, isExpanded } }) => (
        <Pressable
          onPress={() => toggleSection(title)}
          accessibilityLabel={`${title}. ${t(
            `common.openedStatus.${isExpanded}`,
          )}. ${t(`common.openedStatusAction.${isExpanded}`)}`}
        >
          <View
            style={{
              paddingLeft: safeAreaInsets.left,
              paddingRight: safeAreaInsets.right,
              paddingVertical: spacing[3],
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderColor: colors.divider,
              borderTopWidth: StyleSheet.hairlineWidth,
            }}
          >
            <TranslucentView />
            <SectionHeader
              title={title}
              separator={false}
              trailingItem={
                <Icon
                  icon={isExpanded ? faChevronUp : faChevronDown}
                  color={colors.secondaryText}
                />
              }
            />
          </View>
        </Pressable>
      )}
      renderItem={({ section, item: lecture }) => {
        return (
          <CourseLectureListItem
            courseId={section.courseId}
            section={section}
            lecture={lecture}
          />
        );
      }}
      ListFooterComponent={<BottomBarSpacer />}
    />
  );
};

type CourseLectureListItemProps = {
  courseId: number;
  section: SectionListData<CourseLecture, CourseLectureSection>;
  lecture: CourseLecture;
};

export const CourseLectureListItem = ({
  courseId,
  section,
  lecture,
}: CourseLectureListItemProps) => {
  const isDisabled = useOfflineDisabled();
  const { data: teacher } = useGetPerson(lecture.teacherId);
  const { marginHorizontal } = useSafeAreaSpacing();
  const { fontSizes } = useTheme();
  const { t } = useTranslation();

  let duration = null;
  if (isRecordedVC(lecture) || isVideoLecture(lecture)) {
    duration = lecture.duration;
  }

  return (
    <ListItem
      title={lecture.title}
      subtitle={[
        formatDate(lecture.createdAt),
        duration,
        teacher && `${teacher.firstName} ${teacher.lastName}`,
      ]
        .filter(i => !!i)
        .join(' - ')}
      accessibilityLabel={[
        lecture.title,
        duration
          ?.replace('m', t('common.minutes'))
          ?.replace('h', t('common.hours')),
        teacher && `${teacher.firstName} ${teacher.lastName}`,
      ]
        .filter(i => !!i)
        .join(' - ')}
      leadingItem={
        <Icon
          icon={section.type === 'VideoLecture' ? faVideo : faChalkboardTeacher}
          size={fontSizes['2xl']}
        />
      }
      linkTo={{
        screen:
          section.type === 'VideoLecture'
            ? 'CourseVideolecture'
            : 'CourseVirtualClassroom',
        params: {
          courseId,
          lectureId: lecture.id,
          teacherId: lecture.teacherId,
        },
      }}
      containerStyle={marginHorizontal}
      disabled={isDisabled}
    />
  );
};
