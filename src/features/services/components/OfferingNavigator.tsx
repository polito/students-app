import { useTranslation } from 'react-i18next';

import { TopTabBar } from '@lib/ui/components/TopTabBar';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParamListBase } from '@react-navigation/native';

import { Offerings } from './Offerings';

export interface OfferingTabsParamList extends ParamListBase {
  OfferingBachelorScreen: undefined;
  OfferingMasterScreen: undefined;
}

const TopTabs = createMaterialTopTabNavigator<OfferingTabsParamList>();

export const OfferingBachelorScreen = () => <Offerings type="bachelor" />;
export const OfferingMasterScreen = () => <Offerings type="master" />;

export const OfferingNavigator = () => {
  const { t } = useTranslation();

  return (
    <TopTabs.Navigator tabBar={props => <TopTabBar {...props} />}>
      <TopTabs.Screen
        name="OfferingBachelorScreen"
        component={OfferingBachelorScreen}
        options={{
          title: t('offeringBachelorScreen.title'),
        }}
      />
      <TopTabs.Screen
        name="OfferingMasterScreen"
        component={OfferingMasterScreen}
        options={{
          title: t('offeringMasterScreen.title'),
        }}
      />
    </TopTabs.Navigator>
  );
};
