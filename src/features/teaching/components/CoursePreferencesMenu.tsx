import { PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ContextMenu, { ContextMenuProps } from 'react-native-context-menu-view';

import { useTheme } from '@lib/ui/hooks/useTheme';

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
}: PropsWithChildren<Partial<ContextMenuProps> & Props>) => {
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
    <ContextMenu
      {...rest}
      dropdownMenuMode={!shouldOpenOnLongPress}
      actions={[]}
    >
      {children}
    </ContextMenu>
  );
};
