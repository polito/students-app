import { useTheme } from '@lib/ui/hooks/useTheme';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { CourseIcon } from './CourseIcon';

interface Props {
  courseId: number;
}

export const CourseIndicator = ({ courseId }: Props) => {
  const { colors } = useTheme();
  const prefs = usePreferencesContext();
  const coursePrefs = prefs.courses[courseId];

  if (!coursePrefs) {
    return <CourseIcon color={colors.primary[500]} />;
  }
  return <CourseIcon color={coursePrefs.color} icon={coursePrefs.icon} />;
};
