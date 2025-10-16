import { PropsWithChildren, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Alert, Platform, View } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useQueryClient } from '@tanstack/react-query';

import { AGENDA_QUERY_PREFIX } from '~/features/agenda/queries/agendaHooks';
import { LECTURES_QUERY_PREFIX } from '~/features/agenda/queries/lectureHooks';

import { IS_ANDROID } from '../../../core/constants';
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
  const queryClient = useQueryClient();
  const isHidden =
    preferences.courses[course.uniqueShortcode]?.isHidden ?? false;

  const handleMenuAction = useCallback(() => {
    preferences.updatePreference('courses', {
      ...preferences.courses,
      [course.uniqueShortcode!]: {
        ...preferences.courses[course.uniqueShortcode],
        isHidden: !isHidden,
      },
    });
    queryClient
      .invalidateQueries({ queryKey: [LECTURES_QUERY_PREFIX] })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: [AGENDA_QUERY_PREFIX] });
      });
    let message = '';
    if (!isHidden) {
      message = t('courseListItem.courseHidden');
    } else {
      message = t('courseListItem.courseShown');
    }
    AccessibilityInfo.announceForAccessibility(message);
  }, [preferences, course.uniqueShortcode, isHidden, queryClient, t]);

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
}: Props) => {
  const { colors, spacing, fontSizes } = useTheme();
  const { t } = useTranslation();

  const prefs = usePreferencesContext();
  const coursePrefs = prefs.courses[course?.uniqueShortcode];
  const isHidden = coursePrefs?.isHidden ?? false;

  const hasDetails = isCourseDetailed(course);
  const courseInfo = getLatestCourseInfo(course);
  const queryClient = useQueryClient();

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

  const accessibleExtraText = useMemo(() => {
    return IS_ANDROID ? '' : t('coursesScreen.longPress');
  }, [t]);

  const accessibleText = useMemo(() => {
    return `${accessibilityLabel || ''} ${course.name},  ${course.cfu} ${t(
      'common.credits',
    )},  ${
      isHidden ? t('coursesScreen.notVisible') : ''
    }   ${accessibleExtraText}   `;
  }, [
    course.name,
    course.cfu,
    isHidden,
    accessibleExtraText,
    accessibilityLabel,
    t,
  ]);

  const listItem = (
    <ListItem
      accessible={accessible}
      disabled={isDisabled || course.isOverBooking}
      linkTo={
        hasDetails
          ? {
              screen: 'Course',
              params: {
                id: courseInfo?.id,
              },
            }
          : undefined
      }
      onPress={() => {
        if (!hasDetails) {
          Alert.alert(t('courseListItem.courseWithoutDetailsAlertTitle'));
        }
      }}
      accessibilityLabel={accessibleText}
      accessibilityRole="button"
      title={course.name}
      subtitle={subtitle}
      leadingItem={<CourseIndicator uniqueShortcode={course.uniqueShortcode} />}
      trailingItem={
        <>
          {badge && <UnreadBadge text={badge} />}
          {hasDetails ? (
            <View
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('courseListItem.settingsIcon')}
            >
              {Platform.select({
                android: (
                  <Menu course={course}>
                    <IconButton
                      accessible={false}
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
              })}
            </View>
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

  if (hasDetails && Platform.OS === 'ios') {
    return (
      <View
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibleText}
      >
        <Menu course={course}>{listItem}</Menu>
      </View>
    );
  }
  return listItem;
};
