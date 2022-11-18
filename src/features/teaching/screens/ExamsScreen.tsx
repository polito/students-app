import { RefreshControl, ScrollView } from 'react-native';

import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useGetExams } from '../../../core/queries/examHooks';
import { ExamListItem } from '../components/ExamListItem';

export const ExamsScreen = () => {
  const { spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const examsQuery = useGetExams();
  const refreshControl = useRefreshControl(examsQuery);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={<RefreshControl {...refreshControl} />}
      style={bottomBarAwareStyles}
    >
      {!examsQuery.isLoading && (
        <Section>
          <SectionList>
            {examsQuery.data.data.map(exam => (
              <ExamListItem key={exam.id} exam={exam} />
            ))}
          </SectionList>
        </Section>
      )}
    </ScrollView>
  );
};
