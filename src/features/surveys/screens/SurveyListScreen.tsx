import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform } from 'react-native';

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useScreenTitle } from '../../../core/hooks/useScreenTitle';
import { useGetSurveys } from '../../../core/queries/surveysHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { SurveyListItem } from '../components/SurveyListItem';

type Props = NativeStackScreenProps<ServiceStackParamList, 'SurveyList'>;

export const SurveyListScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const { isCompiled } = route.params;

  const surveysQuery = useGetSurveys();
  const { paddingHorizontal } = useSafeAreaSpacing();

  const compiledSurveys = (surveysQuery.data || [])
    .filter(survey => survey.isCompiled === isCompiled)
    .sort(
      (a, b) =>
        b.startsAt.getTime() - a.startsAt.getTime() &&
        b.title.localeCompare(a.title),
    );

  const labels = useMemo(() => {
    return {
      title: isCompiled
        ? t('surveysScreen.compiledTitle')
        : t('cpdSurveysScreen.toBeCompiledTitle'),
      emptyState: isCompiled
        ? t('ticketsScreen.closedEmptyState')
        : t('ticketsScreen.openEmptyState'),
    };
  }, [isCompiled, t]);

  useScreenTitle(labels.title);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={paddingHorizontal}
      refreshControl={<RefreshControl queries={[surveysQuery]} manual />}
      data={compiledSurveys}
      renderItem={({ item }) => <SurveyListItem survey={item} key={item.id} />}
      ItemSeparatorComponent={Platform.select({
        ios: IndentedDivider,
      })}
      ListFooterComponent={<BottomBarSpacer />}
      ListEmptyComponent={
        !surveysQuery.isLoading ? (
          <EmptyState message={t('courseFilesTab.empty')} icon={faCheck} />
        ) : null
      }
    />
  );
};
