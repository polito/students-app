import { PropsWithChildren } from 'react';
import useStateRef from 'react-usestateref';

import { Downloads, DownloadsContext } from '../contexts/DownloadsContext';

export const DownloadsProvider = ({ children }: PropsWithChildren) => {
  const [downloads, setDownloads, downloadsRef] = useStateRef<Downloads>({});

  return (
    <DownloadsContext.Provider
      value={{ downloads, downloadsRef, setDownloads }}
    >
      {children}
    </DownloadsContext.Provider>
  );
};
