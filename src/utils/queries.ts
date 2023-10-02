import { ResponseError } from '@polito/api-client/runtime';
import { InfiniteQueryObserverResult } from '@tanstack/react-query';

import { DateTime } from 'luxon';

import { SuccessResponse } from '../core/types/api';

/**
 * Pluck data from API response
 *
 * @param response
 */
export const pluckData = <T>(response: SuccessResponse<T>) => {
  return response.data;
};

/**
 * Take the last page of data currently persisted in store by the infinite query
 */
export const popPage: {
  <T>(infiniteQuery: InfiniteQueryObserverResult<T>): T;
} = infiniteQuery => {
  return [...infiniteQuery.data!.pages].pop()!;
};

/**
 * Take the first page of data currently persisted in store by the infinite query
 */
export const shiftPage: {
  <T>(infiniteQuery: InfiniteQueryObserverResult<T>): T;
} = infiniteQuery => {
  return [...infiniteQuery.data!.pages].shift()!;
};

export const getPageByPageParam = async <T>(
  infiniteQuery: InfiniteQueryObserverResult<T[]>,
  pageParam: DateTime,
): Promise<T[]> => {
  const pageIndex = infiniteQuery.data?.pageParams.findIndex(
    item => item === pageParam,
  );

  if (pageIndex && pageIndex >= 0) {
    return Promise.resolve([...infiniteQuery.data!.pages[pageIndex]!]);
  }

  // fetch page by its pageParam
  if (
    infiniteQuery.data?.pageParams[0] &&
    pageParam < infiniteQuery.data.pageParams[0]
  ) {
    return await infiniteQuery.fetchPreviousPage({ pageParam }).then(shiftPage);
  }

  return await infiniteQuery.fetchNextPage({ pageParam }).then(popPage);
};

/**
 * Ignore 404 ResponseErrors
 */
export const ignoreNotFound = (e: Error): null => {
  if (e instanceof ResponseError && e.response.status === 404) return null;
  throw e;
};
