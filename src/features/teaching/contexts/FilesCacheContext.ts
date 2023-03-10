import { createContext } from 'react';

export const FilesCacheContext = createContext<{
  cache: Record<string, boolean>;
  refresh: () => void;
}>({ cache: {}, refresh: () => {} });
