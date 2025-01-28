export const formatGrade = (grade: string) =>
  grade
    .toLowerCase()
    .replace(' e lode', 'L')
    .replace('assente', 'grades.absent')
    .replace('fallito', 'grades.fail')
    .replace('superato', 'grades.pass');

export const formatFinalGrade = (grade?: number | null) =>
  [grade ?? '--', 110].join('/');

export const formatExamOnTime = (
  totalOnTimeExamPoints: number | null,
  maxOnTimeExamPoints: number,
) => (totalOnTimeExamPoints ?? '0') + '/' + maxOnTimeExamPoints;

export const formatThirtiethsGrade = (grade?: number | null) =>
  [grade ?? '--', 30].join('/');
