import { Dispatch, RefObject, SetStateAction, createContext } from 'react';

export interface Download {
  jobId?: number;
  isDownloaded: boolean;
  downloadProgress?: number;
}

export type Downloads = Record<string, Download>;

export const DownloadsContext = createContext<{
  downloadsRef: RefObject<Downloads>;
  setDownloads: Dispatch<SetStateAction<Downloads>>;
}>(null);
