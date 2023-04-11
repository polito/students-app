export const formatGrade = (grade: string) =>
  grade
    .toLowerCase()
    .replace(' e lode', 'L')
    .replace('assente', 'grades.absent')
    .replace('fallito', 'grades.fail')
    .replace('superato', 'grades.pass');

export const formatFinalGrade = (grade?: number | null) =>
  [grade ?? '--', 110].join('/');
