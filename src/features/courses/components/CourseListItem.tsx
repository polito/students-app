import { PropsWithChildren, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, View } from 'react-native';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';
import { useQueryClient } from '@tanstack/react-query';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { getCourseKey } from '../../../core/queries/courseHooks';
import { CourseOverview } from '../../../core/types/api';
import { AGENDA_QUERY_PREFIX } from '../../agenda/queries/agendaHooks';
import { LECTURES_QUERY_PREFIX } from '../../agenda/queries/lectureHooks';
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
  shouldOpenOnLongPress,
  children,
}: PropsWithChildren<{
  course: CourseOverview;
  shouldOpenOnLongPress?: boolean;
}>) => {
  const { t } = useTranslation();
  const preferences = usePreferencesContext();
  const queryClient = useQueryClient();

  const isHidden =
    preferences.courses[course.uniqueShortcode]?.isHidden ?? false;

  return (
    <MenuView
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      title={`${t('common.course')} ${t('common.preferences').toLowerCase()}`}
      actions={[
        {
          title: isHidden ? t('common.follow') : t('common.stopFollowing'),
          subtitle: t('coursePreferencesScreen.showInExtractsSubtitle'),
          image: isHidden ? 'eye' : 'eye.slash',
        },
      ]}
      onPressAction={() => {
        preferences.updatePreference('courses', {
          ...preferences.courses,
          [course.uniqueShortcode!]: {
            ...preferences.courses[course.uniqueShortcode],
            isHidden: !isHidden,
          },
        });
        queryClient.invalidateQueries([LECTURES_QUERY_PREFIX]).then(() => {
          queryClient.invalidateQueries([AGENDA_QUERY_PREFIX]);
        });
      }}
    >
      {children}
    </MenuView>
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
                courseName: courseInfo?.name,
                uniqueShortcode: courseInfo?.uniqueShortcode,
              },
            }
          : undefined
      }
      onPress={() => {
        if (!hasDetails) {
          Alert.alert(t('courseListItem.courseWithoutDetailsAlertTitle'));
        }
      }}
      accessibilityLabel={`${accessibilityLabel} ${course.name}, ${
        course.cfu
      } ${t('common.credits')}`}
      title={course.name}
      subtitle={subtitle}
      leadingItem={<CourseIndicator uniqueShortcode={course.uniqueShortcode} />}
      trailingItem={
        <>
          {badge && <UnreadBadge text={badge} />}
          {hasDetails ? (
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

  if (hasDetails && Platform.OS === 'ios') {
    return (
      <View
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} ${course.name},  ${course.cfu}`}
      >
        <Menu course={course} shouldOpenOnLongPress={true}>
          {listItem}
        </Menu>
      </View>
    );
  }
  return listItem;
};
