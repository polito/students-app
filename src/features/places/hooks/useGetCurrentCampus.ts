import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useGetSite } from '../../../core/queries/placesHooks';

export const useGetCurrentCampus = () => {
  const { campusId } = usePreferencesContext();
  return useGetSite(campusId);
};
