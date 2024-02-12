import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { ReadDirItem } from 'react-native-fs';

import { readDirRecursively } from '../../../utils/files';
import { notNullish } from '../../../utils/predicates';
import {
  CourseFilesCacheContext,
  FilesCacheContextProps,
} from '../contexts/CourseFilesCacheContext';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

export const CourseFilesCacheProvider = ({ children }: PropsWithChildren) => {
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
      readDirRecursively(courseFilesCachePath)
        .then(c => (cache = c))
        .catch(() => (cache = []))
        .finally(() => {
          setFilesCacheContext(oldC => ({
            ...oldC,
            refresh,
            cache: Object.fromEntries(
              cache
                ?.map(f => {
                  const fileId = f.path.match(/\((\d+)\)(?:\..+)?$/)?.[1];
                  if (!fileId) {
                    return null;
                  }
                  return [fileId, f.path];
                })
                .filter(notNullish) ?? [],
            ),
            isRefreshing: false,
          }));
        });
    }
  }, [courseFilesCachePath, filesCacheContext.isRefreshing, refresh]);

  return (
    <CourseFilesCacheContext.Provider value={filesCacheContext}>
      {children}
    </CourseFilesCacheContext.Provider>
  );
};
