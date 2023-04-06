export const formatGrade = (grade: string) =>
  grade
    .replace(' e lode', 'L')
    .replace('Assente', 'grades.absent')
    .replace('Fallito', 'grades.fail')
    .replace('Superato', 'grades.pass');

export const formatFinalGrade = (grade?: number | null) =>
  [grade ?? '--', 110].join('/');
