import { useTheme } from '@lib/ui/hooks/useTheme';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { CourseIcon } from './CourseIcon';

interface Props {
  uniqueShortcode: string;
}

export const CourseIndicator = ({ uniqueShortcode }: Props) => {
  const { palettes } = useTheme();
  const prefs = usePreferencesContext();
  const coursePrefs = prefs.courses[uniqueShortcode];

  if (!coursePrefs) {
    return <CourseIcon color={palettes.primary[500]} />;
  }
  return <CourseIcon color={coursePrefs.color} icon={coursePrefs.icon} />;
};
