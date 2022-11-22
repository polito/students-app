import { PropsWithChildren } from 'react';
import useStateRef from 'react-usestateref';

import { Downloads, DownloadsContext } from '../contexts/DownloadsContext';

export const DownloadsProvider = ({ children }: PropsWithChildren) => {
  const [_, setDownloads, downloadsRef] = useStateRef<Downloads>({});

  return (
    <DownloadsContext.Provider value={{ downloadsRef, setDownloads }}>
      {children}
    </DownloadsContext.Provider>
  );
};
