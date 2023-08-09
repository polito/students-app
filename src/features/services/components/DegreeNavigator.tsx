import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TopTabBar } from '@lib/ui/components/TopTabBar';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { getNextShortYear } from '../../../utils/offerings';
import { DegreeContext } from '../context/DegreeContext';
import { DegreeInfoScreen } from '../screens/DegreeInfoScreen';
import { DegreeJobOpportunitiesScreen } from '../screens/DegreeJobOpportunitiesScreen';
import { DegreeTracksScreen } from '../screens/DegreeTracksScreen';
import { ServiceStackParamList } from './ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Degree'>;

export interface DegreeTabsParamList extends ParamListBase {
  DegreeInfoScreen: undefined;
  DegreeJobOpportunitiesScreen: undefined;
  DegreeTracksScreen: undefined;
}
const TopTabs = createMaterialTopTabNavigator<DegreeTabsParamList>();
export const DegreeNavigator = ({ route, navigation }: Props) => {
  const { palettes } = useTheme();
  const { t } = useTranslation();
  const { id } = route.params;
  const [year, setYear] = useState<string | undefined>(undefined);
  const degreeQuery = useGetOfferingDegree({
    degreeId: id,
    year,
  });

  useEffect(() => {
    const editions = degreeQuery.data?.data?.editions;
    const degreeYear = degreeQuery.data?.data?.year;
    if (degreeYear) {
      setYear(degreeYear);
      const actions =
        editions?.map(edition => ({
          id: edition.toString(),
          title: `${edition.toString()}/${getNextShortYear(
            edition.toString(),
          )}`,
        })) || [];
      navigation.setOptions({
        headerRight: () => (
          <MenuView
            actions={actions}
            onPressAction={async ({ nativeEvent: { event } }) => {
              setYear(() => event);
              await degreeQuery.refetch();
            }}
          >
            <Row align="center">
              <Text variant="prose">
                {degreeYear}/{getNextShortYear(degreeYear)}
              </Text>
              {!!actions && (
                <Icon
                  icon={faAngleDown}
                  color={palettes.primary[600]}
                  size={12}
                />
              )}
            </Row>
          </MenuView>
        ),
      });
    }
  }, [degreeQuery, navigation, palettes.primary]);

  return (
    <DegreeContext.Provider value={{ degreeId: id, year }}>
      <TopTabs.Navigator tabBar={props => <TopTabBar {...props} />}>
        <TopTabs.Screen
          name="DegreeInfoScreen"
          component={DegreeInfoScreen}
          options={{ title: t('degreeScreen.info') }}
        />
        <TopTabs.Screen
          name="DegreeJobOpportunitiesScreen"
          component={DegreeJobOpportunitiesScreen}
          options={{ title: t('degreeScreen.jobOpportunities') }}
        />
        <TopTabs.Screen
          name="DegreeTracksScreen"
          component={DegreeTracksScreen}
          options={{ title: t('degreeScreen.tracks') }}
        />
      </TopTabs.Navigator>
    </DegreeContext.Provider>
  );
};
