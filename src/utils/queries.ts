import { ResponseError } from '@polito/api-client';

import { SuccessResponse } from '../core/types/api';

export class ApiError extends Error {
  constructor(
    public readonly error: string,
    public readonly code: number,
    public readonly responseCode?: number,
    public readonly serverResponse?: unknown,
    public cause?: Error,
  ) {
    super(error);
  }
}

/**
 * Pluck data from API response
 *
 * @param response
 */
export const pluckData = <T>(response: SuccessResponse<T>) => {
  return response.data;
};

export const parseApiError = async (error: Error): Promise<ApiError | null> => {
  if (!(error instanceof ResponseError)) {
    return null;
  }
  const data = await error.response.json();
  return new ApiError(
    data.message || data.error,
    data.code,
    error.response.status,
    data,
    error,
  );
};

export const rethrowApiError = async (error: Error): Promise<never> => {
  const pluckedError = await parseApiError(error);
  if (pluckedError) {
    throw pluckedError;
  }
  throw error;
};

/**
 * Ignore 404 ResponseErrors
 */
export const ignoreNotFound = (e: Error): null => {
  if (e instanceof ResponseError && e.response.status === 404) return null;
  throw e;
};
