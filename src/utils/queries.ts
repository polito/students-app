import { ResponseError } from '@polito/api-client/runtime';

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
 * Ignore 404 ResponseErrors
 */
export const ignoreNotFound = (e: Error): null => {
  if (e instanceof ResponseError && e.response.status === 404) return null;
  throw e;
};
