/* eslint-disable react-hooks/rules-of-hooks */
// TODO see above
import { ResponseError } from '@polito/api-client/runtime';
import { InfiniteQueryObserverResult } from '@tanstack/react-query';

import { useApiContext } from '../core/contexts/ApiContext';
import { SuccessResponse } from '../core/types/api';

/**
 * Add student username as key prefix to allow identity switch while keeping cache
 *
 * @param queryKey
 */
export const prefixKey = (queryKey: (string | number)[]) => {
  const { username } = useApiContext();
  return [username, ...queryKey];
};

/**
 * Add student username as key prefix to all passed keys to allow identity switch while keeping cache
 *
 * @param queryKeys
 */
export const prefixKeys = (queryKeys: (string | number)[][]) => {
  const { username } = useApiContext();
  return queryKeys.map(q => [username, ...q]);
};

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
