import { useApiContext } from '../core/contexts/ApiContext';

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
 * Add student username as key prefix to allow identity switch while keeping cache
 *
 * @param queryKeys
 */
export const prefixKeys = (queryKeys: (string | number)[][]) => {
  const { username } = useApiContext();
  return queryKeys.map(queryKey => [username, ...queryKey]);
};
