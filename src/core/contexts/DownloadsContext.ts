import {
  Dispatch,
  RefObject,
  SetStateAction,
  createContext,
  useContext,
} from 'react';

export interface Download {
  jobId?: number;
  isDownloaded: boolean;
  downloadProgress?: number;
}

export type Downloads = Record<string, Download>;

export const DownloadsContext = createContext<{
  downloadsRef: RefObject<Downloads>;
  setDownloads: Dispatch<SetStateAction<Downloads>>;
} | null>(null);

export const useDownloadsContext = () => {
  const downloadsContext = useContext(DownloadsContext);
  if (!downloadsContext)
    throw new Error(
      'No DownloadsContext.Provider found when calling useDownloadsContext.',
    );
  return downloadsContext;
};
