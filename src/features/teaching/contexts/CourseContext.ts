import { createContext, useContext } from 'react';

export const CourseContext = createContext<number | undefined>(undefined);

export const useCourseContext = () => {
  const courseContext = useContext(CourseContext);
  if (!courseContext)
    throw new Error(
      'No CourseContext.Provider found when calling useCourseContext.',
    );
  return courseContext;
};
