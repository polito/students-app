import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetExams } from '../../../core/queries/examHooks';
import { ExamListItem } from '../components/ExamListItem';

export const ExamsScreen = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const examsQuery = useGetExams();
  const refreshControl = useRefreshControl(examsQuery);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      {!examsQuery.isLoading &&
        (examsQuery.data.data.length > 0 ? (
          <Section>
            <SectionList>
              {examsQuery.data.data.map(exam => (
                <ExamListItem key={exam.id} exam={exam} />
              ))}
            </SectionList>
          </Section>
        ) : (
          <EmptyState message={t('examsScreen.emptyState')} icon={faCalendar} />
        ))}
    </ScrollView>
  );
};
