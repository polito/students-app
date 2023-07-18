import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useGetExams } from '../../../core/queries/examHooks';
import { ExamListItem } from '../components/ExamListItem';

export const ExamsScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const examsQuery = useGetExams();
  const { accessibilityListLabel } = useAccessibility();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      accessibilityRole="list"
      accessibilityLabel={t('examsScreen.total', {
        total: examsQuery.data?.length ?? 0,
      })}
      refreshControl={<RefreshControl queries={[examsQuery]} manual />}
    >
      <SafeAreaView>
        {!examsQuery.isLoading &&
          (examsQuery.data && examsQuery.data.length > 0 ? (
            <Section>
              <OverviewList indented>
                {examsQuery.data.map((exam, index) => (
                  <ExamListItem
                    key={exam.id}
                    exam={exam}
                    accessible={true}
                    accessibilityLabel={accessibilityListLabel(
                      index,
                      examsQuery.data.length,
                    )}
                  />
                ))}
              </OverviewList>
            </Section>
          ) : (
            <EmptyState
              message={t('examsScreen.emptyState')}
              icon={faCalendar}
            />
          ))}
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
