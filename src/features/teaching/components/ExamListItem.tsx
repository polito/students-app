import { ListItem } from '@lib/ui/components/ListItem';
import { Exam } from '@polito/api-client';

interface Props {
  exam: Exam;
}

export const ExamListItem = ({ exam }: Props) => {
  return (
    <ListItem
      linkTo={{
        screen: 'Exam',
        params: { id: exam.id },
      }}
      title={exam.courseName}
      subtitle={`${exam.examStartsAt.toLocaleString()} - ${exam.classrooms}`}
    />
  );
};
