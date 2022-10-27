import { ScrollView } from 'react-native';

import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetExams } from '../../../core/queries/examHooks';
import { ExamListItem } from '../components/ExamListItem';

export const ExamsScreen = () => {
  const { spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const examsQuery = useGetExams();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingVertical: spacing[5],
      }}
      refreshControl={createRefreshControl(examsQuery)}
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
