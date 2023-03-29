import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetExams } from '../../../core/queries/examHooks';
import { ExamListItem } from '../components/ExamListItem';

export const ExamsScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const examsQuery = useGetExams();
  const { accessibilityListLabel } = useAccessibility();
  const refreshControl = useRefreshControl(examsQuery);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      accessibilityRole="list"
      accessibilityLabel={t('examsScreen.total', {
        total: examsQuery.data?.length ?? 0,
      })}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      {!examsQuery.isLoading &&
        (examsQuery.data?.length > 0 ? (
          <Section>
            <SectionList>
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
            </SectionList>
          </Section>
        ) : (
          <EmptyState message={t('examsScreen.emptyState')} icon={faCalendar} />
        ))}
    </ScrollView>
  );
};
