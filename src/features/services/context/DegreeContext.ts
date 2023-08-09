import { createContext, useContext } from 'react';

export const DegreeContext = createContext<{
  degreeId?: string;
  year?: string;
}>({});

export const useCourseContext = () => {
  const degreeContext = useContext(DegreeContext);
  if (!degreeContext)
    throw new Error(
      'No DegreeContext.Provider found when calling useDegreeContext.',
    );
  return degreeContext;
};
