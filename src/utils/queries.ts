import { ResponseError } from '@polito/api-client/runtime';
import { InfiniteQueryObserverResult } from '@tanstack/react-query';

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

/**
 * Ignore 404 ResponseErrors
 */
export const ignoreNotFound = (e: Error): null => {
  if (e instanceof ResponseError && e.response.status === 404) return null;
  throw e;
};
