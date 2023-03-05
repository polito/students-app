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
