import { useTranslation } from 'react-i18next';

import { TopTabBar } from '@lib/ui/components/TopTabBar';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParamListBase } from '@react-navigation/native';

import { CareerScreen } from '../screens/CareerScreen';
import { GradesScreen } from '../screens/GradesScreen';

export interface TranscriptTabs extends ParamListBase {
  OfferingBachelorScreen: undefined;
  OfferingMasterScreen: undefined;
}

const TopTabs = createMaterialTopTabNavigator<TranscriptTabs>();

export const TranscriptTopTabsNavigator = () => {
  const { t } = useTranslation();

  return (
    <TopTabs.Navigator tabBar={props => <TopTabBar {...props} />}>
      <TopTabs.Screen
        name="TranscriptGrades"
        component={GradesScreen}
        options={{ title: t('transcriptGradesScreen.title') }}
      />
      <TopTabs.Screen
        name="TranscriptCareer"
        component={CareerScreen}
        options={{ title: t('transcriptMetricsScreen.title') }}
      />
    </TopTabs.Navigator>
  );
};
