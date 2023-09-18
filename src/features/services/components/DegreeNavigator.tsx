import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

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
import { getShortYear } from '../../../utils/offerings';
import { DegreeContext } from '../context/DegreeContext';
import { DegreeInfoScreen } from '../screens/DegreeInfoScreen';
import { DegreeJobOpportunitiesScreen } from '../screens/DegreeJobOpportunitiesScreen';
import { DegreeTracksScreen } from '../screens/DegreeTracksScreen';
import { OfferingStackParamList } from './ServicesNavigator';

type Props = NativeStackScreenProps<OfferingStackParamList, 'Degree'>;

export interface DegreeTabsParamList extends ParamListBase {
  DegreeInfoScreen: undefined;
  DegreeJobOpportunitiesScreen: undefined;
  DegreeTracksScreen: undefined;
}
const TopTabs = createMaterialTopTabNavigator<DegreeTabsParamList>();
export const DegreeNavigator = ({ route, navigation }: Props) => {
  const { palettes, spacing, dark } = useTheme();
  const { t } = useTranslation();
  const { id: degreeId, year: initialYear } = route.params;
  const [year, setYear] = useState(initialYear);
  const degreeQuery = useGetOfferingDegree({ degreeId, year });

  useEffect(() => {
    const editions = degreeQuery.data?.editions || [];
    const degreeYear = degreeQuery.data?.year;
    if (degreeYear) {
      const nextDegreeYear = Number(degreeYear) + 1;
      setYear(degreeYear);
      const accessibilityLabel = [
        t('profileScreen.enrollmentYear', {
          enrollmentYear: `${degreeYear}/${getShortYear(nextDegreeYear)}`,
        }),
      ].join(' ');
      navigation.setOptions({
        headerRight: () => (
          <View
            accessibilityLabel={accessibilityLabel}
            importantForAccessibility="yes"
            accessibilityRole="button"
            accessible={true}
          >
            <MenuView
              style={{ padding: spacing[1] }}
              actions={editions?.map(edition => ({
                id: edition.toString(),
                title: `${edition}/${getShortYear(Number(edition) + 1)}`,
                state: edition === degreeYear ? 'on' : undefined,
              }))}
              onPressAction={async ({ nativeEvent: { event } }) => {
                setYear(() => event);
                await degreeQuery.refetch();
              }}
            >
              <Row align="center">
                <Text variant="prose">
                  {degreeYear}/{getShortYear(nextDegreeYear)}
                </Text>
                {!!editions && (
                  <Icon
                    style={{ marginLeft: spacing[1] }}
                    icon={faAngleDown}
                    color={dark ? palettes.text[300] : palettes.primary[600]}
                    size={12}
                  />
                )}
              </Row>
            </MenuView>
          </View>
        ),
      });
    }
  }, [
    navigation,
    spacing,
    degreeQuery,
    t,
    dark,
    palettes.primary,
    palettes.text,
  ]);

  return (
    <DegreeContext.Provider value={{ degreeId, year }}>
      <TopTabs.Navigator tabBar={props => <TopTabBar {...props} />}>
        <TopTabs.Screen
          name="DegreeInfoScreen"
          component={DegreeInfoScreen}
          options={{ title: t('degreeScreen.info') }}
        />
        <TopTabs.Screen
          name="DegreeTracksScreen"
          component={DegreeTracksScreen}
          options={{ title: t('degreeScreen.tracks') }}
        />
        <TopTabs.Screen
          name="DegreeJobOpportunitiesScreen"
          component={DegreeJobOpportunitiesScreen}
          options={{ title: t('degreeScreen.jobOpportunities') }}
        />
      </TopTabs.Navigator>
    </DegreeContext.Provider>
  );
};
