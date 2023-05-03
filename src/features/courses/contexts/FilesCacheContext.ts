import { createContext } from 'react';

export type FilesCacheContextProps = {
  cache: Record<string, boolean>;
  refresh: () => void;
  isRefreshing: boolean;
};

export const FilesCacheContext = createContext<FilesCacheContextProps>({
  cache: {},
  refresh: () => {},
  isRefreshing: false,
});
