import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import {
  useGetCpdSurveys,
  useGetSurveys,
} from '../../../core/queries/surveysHooks';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { SurveyListItem } from '../components/SurveyListItem';

type Props = NativeStackScreenProps<TeachingStackParamList, 'CpdSurveys'>;

export const CpdSurveysScreen = ({ route }: Props) => {
  const surveysQuery = useGetSurveys();
  const { data } = useGetCpdSurveys();

  const { t } = useTranslation();
  const { accessibilityListLabel } = useAccessibility();

  const { categoryId, typeId, typeName } = route.params;

  useScreenTitle(typeName);

  const surveys = useMemo(
    () =>
      data?.filter(
        survey =>
          survey.category.id === categoryId && survey.type.id === typeId,
      ),
    [categoryId, data, typeId],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      accessibilityRole="list"
      accessibilityLabel={t('cpdSurveysScreen.total', {
        total: surveys?.length ?? 0,
      })}
      refreshControl={<RefreshControl queries={[surveysQuery]} manual />}
    >
      <SafeAreaView>
        <Section>
          <OverviewList
            emptyStateText={
              surveys && surveys.length === 0
                ? t('cpdSurveysScreen.emptyState')
                : undefined
            }
            indented
            loading={surveysQuery.isLoading}
          >
            {surveys?.map((survey, index) => (
              <SurveyListItem
                key={survey.id}
                survey={survey}
                accessible={true}
                accessibilityLabel={accessibilityListLabel(
                  index,
                  surveys.length,
                )}
              />
            ))}
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
