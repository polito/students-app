import { createContext } from 'react';

export type FilesCacheContextProps = {
  cache: Record<string, string>;
  refresh: () => void;
  isRefreshing: boolean;
};

export const CourseFilesCacheContext = createContext<FilesCacheContextProps>({
  cache: {},
  refresh: () => {},
  isRefreshing: false,
});
