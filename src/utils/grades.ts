export const formatGrade = (grade: string) =>
  grade
    .replace(' e lode', 'L')
    .replace('Assente', 'grades.absent')
    .replace('Fallito', 'grades.fail')
    .replace('Superato', 'grades.pass');
