import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TopTabBar } from '@lib/ui/components/TopTabBar';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuAction, MenuView } from '@react-native-menu/menu';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
import { setCustomBackHandler } from '../../../utils/navigation';
import { getShortYear } from '../../../utils/offerings';
import { OfferingStackParamList } from '../../services/components/ServicesNavigator';
import { DegreeContext } from '../contexts/DegreeContext';
import { DegreeInfoScreen } from '../screens/DegreeInfoScreen';
import { DegreeJobOpportunitiesScreen } from '../screens/DegreeJobOpportunitiesScreen';
import { DegreeTracksScreen } from '../screens/DegreeTracksScreen';

type Props = NativeStackScreenProps<OfferingStackParamList, 'Degree'>;

export interface DegreeTabsParamList extends ParamListBase {
  DegreeInfoScreen: undefined;
  DegreeJobOpportunitiesScreen: undefined;
  DegreeTracksScreen: undefined;
}
const TopTabs = createMaterialTopTabNavigator<DegreeTabsParamList>();
export const DegreeTopTabsNavigator = ({ route, navigation }: Props) => {
  const { palettes, spacing, dark } = useTheme();
  const { t } = useTranslation();
  const { id: degreeId, year: initialYear, isCrossNavigation } = route.params;
  const [year, setYear] = useState(initialYear);
  const degreeQuery = useGetOfferingDegree({ degreeId, year });

  const isOffline = useOfflineDisabled();

  useEffect(() => {
    setCustomBackHandler(navigation, isCrossNavigation ?? false);
  }, [isCrossNavigation, navigation]);

  const yearOptions = useMemo(() => {
    if (
      !degreeQuery?.data?.editions ||
      degreeQuery.data.editions.length < 2 ||
      isOffline
    )
      return [];

    return degreeQuery.data.editions?.map(
      edition =>
        ({
          id: edition,
          title: edition,
          state: edition === year ? 'on' : undefined,
        } as MenuAction),
    );
  }, [degreeQuery?.data?.editions, isOffline, year]);

  useEffect(() => {
    if (!degreeQuery.data) return;
    const degreeYear = degreeQuery.data.year;
    const nextDegreeYear = Number(degreeYear) + 1;
    // setYear(degreeYear);
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
            title={t('degreeScreen.cohort')}
            style={{ padding: spacing[1] }}
            actions={yearOptions}
            onPressAction={async ({ nativeEvent: { event } }) => {
              setYear(() => event);
            }}
          >
            <Row align="center">
              <Text variant="prose">
                {degreeYear}/{getShortYear(nextDegreeYear)}
              </Text>
              {yearOptions.length > 0 && (
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
  }, [
    navigation,
    spacing,
    degreeQuery,
    t,
    dark,
    palettes.primary,
    palettes.text,
    yearOptions,
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
          name="Degree1TracksScreen"
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
