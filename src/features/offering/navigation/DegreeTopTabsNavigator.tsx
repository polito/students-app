import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { StatefulMenuView } from '@lib/ui/components/StatefulMenuView';
import { Text } from '@lib/ui/components/Text';
import { TopTabBar } from '@lib/ui/components/TopTabBar';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../../../../src/core/contexts/PreferencesContext';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetOfferingDegree } from '../../../core/queries/offeringHooks';
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
  const { id: degreeId, year: initialYear } = route.params;
  const [year, setYear] = useState(initialYear);
  const degreeQuery = useGetOfferingDegree({ degreeId, year });
  const { accessibility } = usePreferencesContext();
  const isOffline = useOfflineDisabled();

  const yearOptions = useMemo(() => {
    if (
      !degreeQuery?.data?.editions ||
      degreeQuery.data.editions.length < 2 ||
      isOffline
    )
      return [];

    return degreeQuery.data.editions;
  }, [degreeQuery.data?.editions, isOffline]);

  useEffect(() => {
    if (!degreeQuery.data) return;
    const degreeYear = Number(degreeQuery.data.year);
    const previousDegreeYear = degreeYear - 1;
    const accessibilityLabel = [
      t('profileScreen.enrollmentYear', {
        enrollmentYear: `${previousDegreeYear}/${getShortYear(degreeYear)}`,
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
          <StatefulMenuView
            title={t('degreeScreen.cohort')}
            style={{ padding: spacing[1] }}
            actions={yearOptions}
            onPressAction={({ nativeEvent: { event } }) => setYear(event)}
          >
            <Row
              align="center"
              style={{
                marginTop:
                  accessibility?.fontSize &&
                  accessibility.fontSize >= 150 &&
                  Platform.OS === 'ios'
                    ? -spacing[3]
                    : 0,
              }}
            >
              <Text variant="prose">
                {previousDegreeYear}/{getShortYear(degreeYear)}
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
          </StatefulMenuView>
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
    accessibility?.fontSize,
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
