import { DegreeOverview, OfferingResponse, Student } from '@polito/api-client';

export const getStudentEnrollmentYear = (student?: Student) => {
  if (!student) return '...';
  return `${student.firstEnrollmentYear - 1}/${student.firstEnrollmentYear}`;
};

const matchDegreeByName = (name: string) => (degree: DegreeOverview) =>
  degree.name?.toUpperCase() === name;

export const getStudentDegree = (
  student?: Student,
  offerings?: OfferingResponse,
) => {
  if (!offerings || !student?.degreeName) return null;

  const degreeName = student.degreeName.toUpperCase();

  const matchingDegrees = [
    ...(offerings?.bachelor || []),
    ...(offerings?.master || []),
  ].find(offering =>
    offering.degrees.find(matchDegreeByName(degreeName)),
  )?.degrees;

  return matchingDegrees?.find(matchDegreeByName(degreeName));
};
