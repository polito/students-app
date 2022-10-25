import { useTheme } from '@lib/ui/hooks/useTheme';

import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { GuestNavigator } from './GuestNavigator';
import { RootNavigator } from './RootNavigator';

export const AppContent = () => {
  const { updatePreference } = usePreferencesContext();
  const { colors } = useTheme();
  updatePreference('types', {
    Lecture: { color: colors.primary[500] },
    Deadline: { color: colors.success[500] },
    Booking: { color: colors.error[400] },
  });
  const { isLogged } = useApiContext();

  return isLogged ? <RootNavigator /> : <GuestNavigator />;
};
