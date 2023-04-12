import { PropsWithChildren, useEffect, useState } from 'react';
import { readDir } from 'react-native-fs';

import { FilesCacheContext } from '../contexts/FilesCacheContext';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

export const FilesCacheProvider = ({ children }: PropsWithChildren) => {
  const courseFilesCachePath = useCourseFilesCachePath();
  const [isReadingFs, setIsReadingFs] = useState(false);
  const [cacheFs, setCacheFs] = useState<Record<string, boolean>>({});

  const refresh = () => {
    if (courseFilesCachePath && !isReadingFs) {
      setIsReadingFs(true);
      readDir(courseFilesCachePath)
        .then(cache => {
          setCacheFs(Object.fromEntries(cache?.map(f => [f.path, true]) ?? []));
        })
        .catch(() => {
          setCacheFs({});
        })
        .finally(() => {
          setIsReadingFs(false);
        });
    }
  };

  useEffect(() => {
    refresh();
  }, [courseFilesCachePath, isReadingFs]);

  return (
    <FilesCacheContext.Provider value={{ cache: cacheFs, refresh }}>
      {children}
    </FilesCacheContext.Provider>
  );
};
