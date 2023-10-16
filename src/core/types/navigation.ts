import { NavigatorScreenParams } from '@react-navigation/native';

import { AgendaStackParamList } from '../../features/agenda/components/AgendaNavigator';
import { ServiceStackParamList } from '../../features/services/components/ServicesNavigator';
import { TeachingStackParamList } from '../../features/teaching/components/TeachingNavigator';
import { UserStackParamList } from '../../features/user/components/UserNavigator';

export type RootParamList = {
  TeachingTab: NavigatorScreenParams<TeachingStackParamList>;
  AgendaTab: NavigatorScreenParams<AgendaStackParamList>;
  PlacesTab: NavigatorScreenParams<never>;
  ServicesTab: NavigatorScreenParams<ServiceStackParamList>;
  ProfileTab: NavigatorScreenParams<UserStackParamList>;
};
