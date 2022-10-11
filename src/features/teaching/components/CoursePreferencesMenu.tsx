import { PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuComponentProps, MenuView } from '@react-native-menu/menu';

import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useGetCourse } from '../../../core/queries/courseHooks';

const SHOW_IN_HOME_SCREEN_ACTION = 'SHOW_IN_HOME_SCREEN_ACTION';
const TOGGLE_NOTICES_NOTIFICATIONS_ACTION =
  'TOGGLE_NOTICES_NOTIFICATIONS_ACTION';
const TOGGLE_FILES_NOTIFICATIONS_ACTION = 'TOGGLE_FILES_NOTIFICATIONS_ACTION';
const TOGGLE_LESSONS_NOTIFICATIONS_ACTION =
  'TOGGLE_LESSONS_NOTIFICATIONS_ACTION';

interface Props {
  courseId: number;
}

export const CoursePreferencesMenu = ({
  courseId,
  children,
  shouldOpenOnLongPress = false,
  ...rest
}: PropsWithChildren<Partial<MenuComponentProps> & Props>) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { courses, updatePreference } = useContext(PreferencesContext);
  const coursePrefs = courses[courseId];
  const { data: course } = useGetCourse(courseId);
  const courseColors = useMemo(
    () => [
      { name: 'Dark blue', color: colors.darkBlue[400] },
      { name: 'Orange', color: colors.orange[400] },
      { name: 'Rose', color: colors.rose[400] },
      { name: 'Red', color: colors.red[400] },
      { name: 'Green', color: colors.green[400] },
      { name: 'Dark orange', color: colors.darkOrange[400] },
      { name: 'Light blue', color: colors.lightBlue[400] },
    ],
    [colors],
  );

  return (
    <MenuView
      {...rest}
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      actions={[
        {
          title: t('Color'),
          image: Platform.select({
            ios: 'circle.fill',
            android: 'ic_circle',
          }),
          imageColor: coursePrefs?.color ?? '#fff',
          subactions: courseColors.map(cc => ({
            id: `color:${cc.color}`,
            title: cc.name,
            image: Platform.select({
              ios: 'circle.fill',
              android: 'ic_circle',
            }),
            imageColor: cc.color,
          })),
        },
        {
          id: 'icon',
          title: t('Icon'),
          image: Platform.select({
            ios: 'network',
            android: 'ic_public',
          }),
        },
        {
          id: SHOW_IN_HOME_SCREEN_ACTION,
          title: t('Show in home screen'),
          image: Platform.select({
            ios: coursePrefs?.isHidden ? 'eye.slash' : 'eye',
            android: coursePrefs?.isHidden
              ? 'ic_visibility_off'
              : 'ic_visibility',
          }),
          state: coursePrefs?.isHidden ? 'off' : 'on',
        },
        {
          title: t('Notifications'),
          image: Platform.select({
            ios: 'bell',
            android: 'ic_notifications',
          }),
          subactions: [
            {
              id: TOGGLE_NOTICES_NOTIFICATIONS_ACTION,
              title: t('Notices'),
              state: !course?.data
                ? 'mixed'
                : course.data.notifications.avvisidoc
                ? 'on'
                : 'off',
            },
            {
              id: TOGGLE_FILES_NOTIFICATIONS_ACTION,
              title: t('Files'),
              state: !course?.data
                ? 'mixed'
                : course.data.notifications.matdid
                ? 'on'
                : 'off',
            },
            {
              id: TOGGLE_LESSONS_NOTIFICATIONS_ACTION,
              title: t('Lessons'),
              state: !course?.data
                ? 'mixed'
                : course.data.notifications.videolezioni
                ? 'on'
                : 'off',
            },
          ],
        },
      ]}
      onPressAction={({ nativeEvent }) => {
        if (nativeEvent.event.startsWith('color:')) {
          updatePreference('courses', {
            ...courses,
            [courseId]: {
              ...coursePrefs,
              color: nativeEvent.event.split(':')[1],
            },
          });
          return;
        }
        switch (nativeEvent.event) {
          case SHOW_IN_HOME_SCREEN_ACTION:
            updatePreference('courses', {
              ...courses,
              [courseId]: {
                ...coursePrefs,
                isHidden: !coursePrefs.isHidden,
              },
            });
            break;
          default:
        }
      }}
    >
      {children}
    </MenuView>
  );
};
