import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { ReadDirItem, readDir } from 'react-native-fs';

import {
  FilesCacheContext,
  FilesCacheContextProps,
} from '../contexts/FilesCacheContext';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

export const FilesCacheProvider = ({ children }: PropsWithChildren) => {
  const courseFilesCachePath = useCourseFilesCachePath();

  const [filesCacheContext, setFilesCacheContext] =
    useState<FilesCacheContextProps>({
      cache: {},
      refresh: () => {},
      isRefreshing: false,
    });

  const refresh = useCallback(() => {
    setFilesCacheContext(oldP => ({ ...oldP, isRefreshing: true }));
  }, []);

  useEffect(() => {
    // Initialize the cache
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (filesCacheContext.isRefreshing) {
      let cache: ReadDirItem[];
      readDir(courseFilesCachePath)
        .then(c => (cache = c))
        .catch(() => (cache = []))
        .finally(() => {
          setFilesCacheContext(oldC => ({
            ...oldC,
            refresh,
            cache: Object.fromEntries(cache?.map(f => [f.path, true]) ?? []),
            isRefreshing: false,
          }));
        });
    }
  }, [courseFilesCachePath, filesCacheContext.isRefreshing, refresh]);

  return (
    <FilesCacheContext.Provider value={filesCacheContext}>
      {children}
    </FilesCacheContext.Provider>
  );
};
