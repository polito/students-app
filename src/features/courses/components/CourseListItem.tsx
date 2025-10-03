import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { PropsWithChildren, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, View } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  faChevronDown,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { auto } from '@lib/ui/components/Grid';
import { IconButton } from '@lib/ui/components/IconButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useQueryClient } from '@tanstack/react-query';

import { useGetPersons } from '~/core/queries/peopleHooks';

import { IS_ANDROID, courseColors } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { getCourseKey } from '../../../core/queries/courseHooks';
import { CourseOverview } from '../../../core/types/api';
import { getLatestCourseInfo, isCourseDetailed } from '../utils/courses';
import { CourseIndicator } from './CourseIndicator';

interface Props {
  course: CourseOverview;
  accessible?: boolean;
  accessibilityLabel?: string;
  badge?: number;
  showAllModules?: boolean;
}

const Menu = ({
  course,
  children,
}: PropsWithChildren<{
  course: CourseOverview;
}>) => {
  const { t } = useTranslation();
  const preferences = usePreferencesContext();
  const { dark, colors } = useTheme();
  const isHidden = course.uniqueShortcode
    ? (preferences.courses[course.uniqueShortcode]?.isHidden ?? false)
    : false;

  const handleMenuAction = useCallback(() => {
    if (!course.uniqueShortcode) return;

    const currentPrefs = preferences.courses[course.uniqueShortcode];
    const defaultPrefs = {
      color: courseColors[0].color,
      isHidden: false,
      isHiddenInAgenda: false,
    };

    preferences.updatePreference('courses', {
      ...preferences.courses,
      [course.uniqueShortcode]: {
        ...defaultPrefs,
        ...currentPrefs,
        isHidden: !isHidden,
      },
    });
  }, [preferences, course.uniqueShortcode, isHidden]);

  return (
    <ContextMenu
      dropdownMenuMode={IS_ANDROID}
      title={`${t('common.course')} ${t('common.preferences').toLowerCase()}`}
      actions={[
        {
          title: isHidden ? t('common.follow') : t('common.stopFollowing'),
          subtitle: t('coursePreferencesScreen.showInExtractsSubtitle'),
          systemIcon: isHidden ? 'eye' : 'eye.slash',
          titleColor: dark ? colors.white : colors.black,
        },
      ]}
      onPress={handleMenuAction}
    >
      {children}
    </ContextMenu>
  );
};

export const CourseListItem = ({
  course,
  accessibilityLabel,
  accessible,
  badge,
  showAllModules = false,
}: Props) => {
  const { colors, spacing, palettes, fontSizes, dark } = useTheme();
  const { t } = useTranslation();
  const preferences = usePreferencesContext();

  const hasDetails = isCourseDetailed(course);
  const courseInfo = getLatestCourseInfo(course);
  const queryClient = useQueryClient();
  const pressed = useSharedValue<boolean>(true);

  const animatedHeight = useAnimatedStyle(() => ({
    transform: [
      { scaleY: withTiming(pressed.value ? 1 : 0, { duration: 100 }) },
    ],
    height: withTiming(pressed.value ? auto : 0, { duration: 50 }),
  }));

  const animatedChevron = useAnimatedStyle(() => ({
    transform: [{ rotateX: withTiming(pressed.value ? '180deg' : '0deg') }],
  }));

  const isDataMissing = useCallback(
    () =>
      !!course.id &&
      queryClient.getQueryData(getCourseKey(course.id)) === undefined,
    [course.id, queryClient],
  );

  const isDisabled = useOfflineDisabled(isDataMissing);

  const subtitle = useMemo(() => {
    return (
      `${course.cfu} ${t('common.credits').toLowerCase()}` +
      (!course.isInPersonalStudyPlan
        ? ` • ${t('courseListItem.extra')} • ${course.year}`
        : '') +
      (course.isOverBooking ? ` • ${t('courseListItem.overbooking')}` : '')
    );
  }, [
    course.cfu,
    course.isInPersonalStudyPlan,
    course.isOverBooking,
    course.year,
    t,
  ]);

  const tap = Gesture.Tap().onTouchesUp(() => {
    pressed.value = !pressed.value;
  });

  const hasModules = course.modules && course.modules.length > 0;

  const getModuleUniqueShortcode = useCallback(
    (moduleId: number) => `${course.uniqueShortcode}-module-${moduleId}`,
    [course.uniqueShortcode],
  );

  const allModulesHidden = useMemo(() => {
    if (!hasModules || showAllModules) return false;
    return course.modules!.every(module => {
      if (!module.id) return false;
      const moduleUniqueShortcode = getModuleUniqueShortcode(module.id);
      return preferences.courses[moduleUniqueShortcode]?.isHidden === true;
    });
  }, [
    hasModules,
    showAllModules,
    course.modules,
    getModuleUniqueShortcode,
    preferences.courses,
  ]);

  const moduleTeacherIds = useMemo(() => {
    if (!hasModules) return [];
    return course
      .modules!.map(module => module.teacherId)
      .filter((teacherId): teacherId is number => teacherId !== null);
  }, [hasModules, course.modules]);

  const { queries: teacherQueries } = useGetPersons(moduleTeacherIds);

  const getTeacherName = useCallback(
    (teacherId: number | null) => {
      if (!teacherId) return null;
      const teacherIndex = moduleTeacherIds.indexOf(teacherId);
      const teacherQuery = teacherQueries[teacherIndex];
      if (teacherQuery?.data) {
        return `${teacherQuery.data.firstName} ${teacherQuery.data.lastName}`.trim();
      }
      return null;
    },
    [moduleTeacherIds, teacherQueries],
  );

  const courseListItem = (
    <ListItem
      accessible={accessible}
      disabled={isDisabled || course.isOverBooking}
      linkTo={
        hasDetails && !hasModules
          ? {
              screen: 'Course',
              params: {
                id: courseInfo?.id,
              },
            }
          : undefined
      }
      onPress={() => {
        if (hasModules) {
          pressed.value = !pressed.value;
        } else if (!hasDetails && !hasModules) {
          Alert.alert(t('courseListItem.courseWithoutDetailsAlertTitle'));
        }
      }}
      accessibilityLabel={`${accessibilityLabel} ${course.name}, ${
        course.cfu
      } ${t('common.credits')}`}
      title={course.name}
      subtitle={subtitle}
      leadingItem={
        hasModules ? undefined : (
          <CourseIndicator uniqueShortcode={course.uniqueShortcode} />
        )
      }
      trailingItem={
        <>
          {badge && <UnreadBadge text={badge} />}
          {hasModules ? (
            <>
              <GestureDetector gesture={tap}>
                <Animated.View style={animatedChevron}>
                  <IconButton
                    icon={faChevronDown}
                    color={dark ? palettes.gray[400] : colors.secondaryText}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: 0,
                      paddingRight: 0,
                    }}
                  />
                </Animated.View>
              </GestureDetector>
              <View style={{ width: 20 }} />
            </>
          ) : course.uniqueShortcode ? (
            Platform.select({
              android: (
                <Menu course={course}>
                  <IconButton
                    style={{
                      padding: spacing[3],
                    }}
                    icon={faEllipsisVertical}
                    color={colors.secondaryText}
                    size={fontSizes.xl}
                  />
                </Menu>
              ),
              ios: <DisclosureIndicator />,
            })
          ) : (
            <View style={{ width: 20 }} />
          )}
        </>
      }
      containerStyle={{
        paddingRight: Platform.select({
          android: 0,
        }),
      }}
    />
  );

  const listItem = (
    <GestureHandlerRootView>
      <View>
        {Platform.OS === 'ios' && hasDetails && !hasModules ? (
          <Menu course={course}>{courseListItem}</Menu>
        ) : (
          courseListItem
        )}
      </View>

      {hasModules && (
        <Animated.View style={[animatedHeight, { overflow: 'hidden' }]}>
          {course.modules
            ?.filter(module => {
              if (showAllModules) return true;
              if (!module.id) return false;
              const moduleUniqueShortcode = getModuleUniqueShortcode(module.id);
              return !preferences.courses[moduleUniqueShortcode]?.isHidden;
            })
            .map((module, index, filteredModules) => {
              const isFirst = index === 0;
              const isLast = index === filteredModules.length - 1;
              const indent = spacing[4];
              const rightIndent = spacing[4];
              return (
                <>
                  {Platform.OS === 'ios' ? (
                    <Menu
                      course={{
                        ...course,
                        uniqueShortcode: module.id
                          ? getModuleUniqueShortcode(module.id)
                          : course.uniqueShortcode,
                      }}
                    >
                      <ListItem
                        key={module.id}
                        accessible={accessible}
                        disabled={isDisabled || module.isOverBooking}
                        linkTo={{
                          screen: 'Course',
                          params: {
                            id: module.id,
                            title: course.name,
                            uniqueShortcode: module.id
                              ? getModuleUniqueShortcode(module.id)
                              : course.uniqueShortcode,
                          },
                        }}
                        onPress={() => {
                          if (!hasDetails) {
                            Alert.alert(
                              t(
                                'courseListItem.courseWithoutDetailsAlertTitle',
                              ),
                            );
                          }
                        }}
                        accessibilityLabel={`${accessibilityLabel} ${module.name}, ${
                          module.cfu
                        } ${t('common.credits')}`}
                        title={module.name}
                        subtitle={(() => {
                          const teacherName = getTeacherName(module.teacherId);
                          return teacherName ?? '';
                        })()}
                        leadingItem={
                          <CourseIndicator
                            uniqueShortcode={
                              module.id
                                ? getModuleUniqueShortcode(module.id)
                                : course.uniqueShortcode
                            }
                          />
                        }
                        trailingItem={<DisclosureIndicator />}
                        style={{
                          overflow: 'hidden',
                          marginHorizontal: spacing[4],
                          borderRadius: isFirst
                            ? spacing[2]
                            : isLast
                              ? spacing[2]
                              : 0,
                          borderTopLeftRadius: isFirst ? spacing[2] : 0,
                          borderTopRightRadius: isFirst ? spacing[2] : 0,
                          borderBottomLeftRadius: isLast ? spacing[2] : 0,
                          borderBottomRightRadius: isLast ? spacing[2] : 0,
                        }}
                        containerStyle={{
                          display: 'flex',
                          alignItems: 'center',
                          marginTop: 0,
                          paddingRight: Platform.select({
                            android: 0,
                          }),
                          backgroundColor: dark
                            ? colors.background
                            : palettes.gray[100],
                          borderTopLeftRadius: isFirst ? spacing[2] : 0,
                          borderTopRightRadius: isFirst ? spacing[2] : 0,
                          borderBottomLeftRadius: isLast ? spacing[2] : 0,
                          borderBottomRightRadius: isLast ? spacing[2] : 0,
                          overflow: 'hidden',
                        }}
                      />
                    </Menu>
                  ) : (
                    <ListItem
                      key={module.id}
                      accessible={accessible}
                      disabled={isDisabled || module.isOverBooking}
                      linkTo={{
                        screen: 'Course',
                        params: {
                          id: module.id,
                          title: course.name,
                          uniqueShortcode: module.id
                            ? getModuleUniqueShortcode(module.id)
                            : course.uniqueShortcode,
                        },
                      }}
                      onPress={() => {
                        if (!hasDetails) {
                          Alert.alert(
                            t('courseListItem.courseWithoutDetailsAlertTitle'),
                          );
                        }
                      }}
                      accessibilityLabel={`${accessibilityLabel} ${module.name}, ${
                        module.cfu
                      } ${t('common.credits')}`}
                      title={module.name}
                      subtitle={(() => {
                        const teacherName = getTeacherName(module.teacherId);
                        return teacherName ?? '';
                      })()}
                      leadingItem={
                        <CourseIndicator
                          uniqueShortcode={
                            module.id
                              ? getModuleUniqueShortcode(module.id)
                              : course.uniqueShortcode
                          }
                        />
                      }
                      trailingItem={
                        <Menu
                          course={{
                            ...course,
                            uniqueShortcode: module.id
                              ? getModuleUniqueShortcode(module.id)
                              : course.uniqueShortcode,
                          }}
                        >
                          <IconButton
                            style={{
                              padding: spacing[3],
                            }}
                            icon={faEllipsisVertical}
                            color={colors.secondaryText}
                            size={fontSizes.xl}
                          />
                        </Menu>
                      }
                      style={{
                        overflow: 'hidden',
                        marginHorizontal: spacing[4],
                        borderRadius: isFirst
                          ? spacing[2]
                          : isLast
                            ? spacing[2]
                            : 0,
                        borderTopLeftRadius: isFirst ? spacing[2] : 0,
                        borderTopRightRadius: isFirst ? spacing[2] : 0,
                        borderBottomLeftRadius: isLast ? spacing[2] : 0,
                        borderBottomRightRadius: isLast ? spacing[2] : 0,
                      }}
                      containerStyle={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: 0,
                        paddingRight: Platform.select({
                          android: 0,
                        }),
                        backgroundColor: dark
                          ? colors.background
                          : palettes.gray[100],
                        borderTopLeftRadius: isFirst ? spacing[2] : 0,
                        borderTopRightRadius: isFirst ? spacing[2] : 0,
                        borderBottomLeftRadius: isLast ? spacing[2] : 0,
                        borderBottomRightRadius: isLast ? spacing[2] : 0,
                        overflow: 'hidden',
                      }}
                    />
                  )}
                  {!isLast && (
                    <IndentedDivider
                      key={`divider-${module.id}`}
                      indent={indent}
                      style={{
                        marginEnd: rightIndent,
                      }}
                    />
                  )}
                </>
              );
            })}
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );

  if (allModulesHidden) {
    return null;
  }

  return listItem;
};
