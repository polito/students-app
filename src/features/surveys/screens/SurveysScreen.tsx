import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faComments } from '@fortawesome/free-regular-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useGetSurveys } from '../../../core/queries/surveysHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { SurveyListItem } from '../components/SurveyListItem';

interface Props {
  navigation: NativeStackNavigationProp<ServiceStackParamList, 'Surveys'>;
}

export const SurveysScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const surveysQuery = useGetSurveys();

  const IncompleteSurveys = () => {
    const incompleteSurveys = (surveysQuery.data || [])
      .filter(survey => !survey.isCompiled)
      .sort(
        (a, b) =>
          b.startsAt.getTime() - a.startsAt.getTime() &&
          b.title.localeCompare(a.title),
      );

    return (
      <Section>
        <SectionHeader title={t('surveysScreen.toBeCompiledTitle')} />
        {!surveysQuery.isLoading &&
          (incompleteSurveys.length > 0 ? (
            <OverviewList indented>
              {incompleteSurveys?.map(survey => (
                <SurveyListItem survey={survey} key={survey.id} />
              ))}
            </OverviewList>
          ) : (
            <OverviewList>
              <EmptyState
                message={t('surveysScreen.toBeCompiledEmptyState')}
                icon={faComments}
              />
            </OverviewList>
          ))}
      </Section>
    );
  };

  const CompiledSurveys = () => {
    const compiledSurveys = (surveysQuery.data || [])
      .filter(survey => survey.isCompiled)
      .sort(
        (a, b) =>
          b.startsAt.getTime() - a.startsAt.getTime() &&
          b.title.localeCompare(a.title),
      );

    const renderedCompiledSurveys = useMemo(
      () => compiledSurveys.slice(0, 4),
      [compiledSurveys],
    );

    return (
      <Section>
        <SectionHeader
          title={t('surveysScreen.compiledTitle')}
          linkTo={{
            screen: 'SurveyList',
            params: { isCompiled: true },
          }}
          linkToMoreCount={
            compiledSurveys.length - renderedCompiledSurveys.length
          }
        />
        {!surveysQuery.isLoading &&
          (renderedCompiledSurveys.length > 0 ? (
            <OverviewList indented>
              {renderedCompiledSurveys.map(survey => (
                <SurveyListItem survey={survey} key={survey.id} />
              ))}
            </OverviewList>
          ) : (
            <OverviewList>
              <EmptyState
                message={t('surveysScreen.compiledEmptyState')}
                icon={faComments}
              />
            </OverviewList>
          ))}
      </Section>
    );
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[surveysQuery]} manual />}
      contentContainerStyle={styles.container}
    >
      <SafeAreaView>
        <IncompleteSurveys />
        <CompiledSurveys />
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
  });
