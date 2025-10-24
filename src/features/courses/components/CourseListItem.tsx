import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { Fragment, PropsWithChildren, useCallback, useMemo } from 'react';
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
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useQueryClient } from '@tanstack/react-query';

import { useGetPersons } from '~/core/queries/peopleHooks';

import { IS_ANDROID, courseColors } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useNotifications } from '../../../core/hooks/useNotifications';
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
  const styles = useStylesheet(createStyles);
  const { getUnreadsCountPerCourse } = useNotifications();

  const getModuleItemStyle = useCallback(
    (isFirst: boolean, isLast: boolean) => {
      return [
        styles.moduleItem,
        isFirst && styles.moduleItemFirst,
        isLast && styles.moduleItemLast,
        !isFirst && !isLast && styles.moduleItemMiddle,
      ];
    },
    [styles],
  );

  const getModuleContainerStyle = useCallback(
    (isFirst: boolean, isLast: boolean) => {
      return [
        styles.moduleContainer,
        isFirst && styles.moduleItemFirst,
        isLast && styles.moduleItemLast,
        !isFirst && !isLast && styles.moduleItemMiddle,
      ];
    },
    [styles],
  );

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
      (course.cfu !== null && course.cfu !== undefined
        ? `${course.cfu} ${t('common.credits').toLowerCase()}`
        : '') +
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
    (moduleIndex: number) => {
      return `${course.shortcode}${moduleIndex + 1}`;
    },
    [course.shortcode],
  );

  const getModuleBadge = useCallback(
    (moduleId: number, previousEditions?: any[]) => {
      return getUnreadsCountPerCourse(moduleId, previousEditions) ?? 0;
    },
    [getUnreadsCountPerCourse],
  );

  const getTotalModuleBadges = useCallback(() => {
    if (!hasModules) return 0;
    return course.modules!.reduce((total, module) => {
      if (module.id) {
        return (
          total +
          (getUnreadsCountPerCourse(module.id, module.previousEditions) ?? 0)
        );
      }
      return total;
    }, 0);
  }, [hasModules, course.modules, getUnreadsCountPerCourse]);

  const allModulesHidden = useMemo(() => {
    if (!hasModules || showAllModules) return false;
    return course.modules!.every((module, index) => {
      if (!module.id) return false;
      const moduleUniqueShortcode = getModuleUniqueShortcode(index);
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
          {(() => {
            if (hasModules) {
              const totalModuleBadges = getTotalModuleBadges();
              return totalModuleBadges > 0 ? (
                <UnreadBadge
                  text={totalModuleBadges}
                  style={Platform.OS === 'android' ? styles.badge : undefined}
                />
              ) : null;
            }
            return badge ? <UnreadBadge text={badge} /> : null;
          })()}
          {hasModules ? (
            <GestureDetector gesture={tap}>
              <Animated.View style={animatedChevron}>
                <IconButton
                  icon={faChevronDown}
                  color={dark ? palettes.gray[400] : colors.secondaryText}
                  style={styles.chevronButton}
                />
              </Animated.View>
            </GestureDetector>
          ) : course.uniqueShortcode ? (
            Platform.select({
              android: (
                <Menu course={course}>
                  <IconButton
                    style={styles.menuButton}
                    icon={faEllipsisVertical}
                    color={colors.secondaryText}
                    size={fontSizes.xl}
                  />
                </Menu>
              ),
              ios: <DisclosureIndicator />,
            })
          ) : (
            <View style={styles.spacer} />
          )}
        </>
      }
      titleStyle={hasModules ? styles.title : undefined}
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
            ?.map((module, originalIndex) => ({ module, originalIndex }))
            .filter(({ module, originalIndex }) => {
              if (showAllModules) return true;
              if (!module.id) return false;
              const moduleUniqueShortcode =
                getModuleUniqueShortcode(originalIndex);
              return !preferences.courses[moduleUniqueShortcode]?.isHidden;
            })
            .map(({ module, originalIndex }, index, filteredModules) => {
              const isFirst = index === 0;
              const isLast = index === filteredModules.length - 1;
              const indent = spacing[4];
              return (
                <Fragment key={module.id || `module-${originalIndex}`}>
                  {Platform.OS === 'ios' ? (
                    <Menu
                      course={{
                        ...course,
                        uniqueShortcode: module.id
                          ? getModuleUniqueShortcode(originalIndex)
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
                                ? getModuleUniqueShortcode(originalIndex)
                                : course.uniqueShortcode
                            }
                          />
                        }
                        trailingItem={
                          <>
                            {module.id &&
                              getModuleBadge(
                                module.id,
                                module.previousEditions,
                              ) > 0 && (
                                <UnreadBadge
                                  text={getModuleBadge(
                                    module.id,
                                    module.previousEditions,
                                  )}
                                  style={styles.badge}
                                />
                              )}
                            <DisclosureIndicator />
                          </>
                        }
                        style={getModuleItemStyle(isFirst, isLast)}
                        containerStyle={getModuleContainerStyle(
                          isFirst,
                          isLast,
                        )}
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
                            ? getModuleUniqueShortcode(originalIndex)
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
                              ? getModuleUniqueShortcode(originalIndex)
                              : course.uniqueShortcode
                          }
                        />
                      }
                      trailingItem={
                        <>
                          {module.id &&
                            getModuleBadge(module.id, module.previousEditions) >
                              0 && (
                              <UnreadBadge
                                text={getModuleBadge(
                                  module.id,
                                  module.previousEditions,
                                )}
                              />
                            )}
                          <Menu
                            course={{
                              ...course,
                              uniqueShortcode: module.id
                                ? getModuleUniqueShortcode(originalIndex)
                                : course.uniqueShortcode,
                            }}
                          >
                            <IconButton
                              style={styles.menuButton}
                              icon={faEllipsisVertical}
                              color={colors.secondaryText}
                              size={fontSizes.xl}
                            />
                          </Menu>
                        </>
                      }
                      style={getModuleItemStyle(isFirst, isLast)}
                      titleStyle={styles.title}
                      containerStyle={getModuleContainerStyle(isFirst, isLast)}
                    />
                  )}
                  {!isLast && (
                    <IndentedDivider
                      key={`divider-${module.id}`}
                      indent={indent}
                      style={styles.divider}
                    />
                  )}
                </Fragment>
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

const createStyles = (theme: Theme) => {
  const { spacing, colors, palettes, dark } = theme;

  return {
    courseContainer: {
      marginHorizontal: spacing[1],
    },
    title: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      marginRight: spacing[3],
    },
    chevronButton: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      marginTop: 0,
      marginRight: Platform.OS === 'ios' ? -spacing[4] : 0,
    },
    spacer: {
      width: 20,
    },
    menuButton: {
      padding: spacing[3],
    },
    moduleItem: {
      overflow: 'hidden' as const,
      marginHorizontal: spacing[5],
    },
    moduleItemFirst: {
      borderRadius: spacing[2],
      borderTopLeftRadius: spacing[2],
      borderTopRightRadius: spacing[2],
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    moduleItemLast: {
      borderRadius: spacing[2],
      borderBottomLeftRadius: spacing[2],
      borderBottomRightRadius: spacing[2],
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      marginBottom: spacing[1],
    },
    moduleItemMiddle: {
      borderRadius: 0,
    },
    moduleContainer: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      marginTop: 0,
      paddingRight: Platform.select({
        android: 0,
      }),
      backgroundColor: dark ? colors.background : palettes.gray[100],
      borderTopLeftRadius: spacing[2],
      borderTopRightRadius: spacing[2],
      borderBottomLeftRadius: spacing[2],
      borderBottomRightRadius: spacing[2],
      overflow: 'hidden' as const,
    },
    divider: {
      marginEnd: spacing[4],
      marginStart: spacing[4],
    },
    badge: {
      marginRight: spacing[1],
    },
    badgeCourseIos: {
      marginRight: -spacing[3],
    },
  };
};
