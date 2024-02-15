import { PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { readDirRecursively } from '../../../utils/files';
import { notNullish } from '../../../utils/predicates';
import {
  CourseFilesCacheContext,
  FilesCacheContextProps,
} from '../contexts/CourseFilesCacheContext';
import { useCourseFilesCachePath } from '../hooks/useCourseFilesCachePath';

export const CourseFilesCacheProvider = ({ children }: PropsWithChildren) => {
  const [principalCache, alternativeCaches] = useCourseFilesCachePath();

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
      Promise.all(
        [principalCache, ...alternativeCaches].map(cachePath =>
          readDirRecursively(cachePath).catch(() => []),
        ),
      )
        .then(caches => caches.flat())
        .then(cache => {
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
  }, [
    principalCache,
    filesCacheContext.isRefreshing,
    refresh,
    alternativeCaches,
  ]);

  return (
    <CourseFilesCacheContext.Provider value={filesCacheContext}>
      {children}
    </CourseFilesCacheContext.Provider>
  );
};
