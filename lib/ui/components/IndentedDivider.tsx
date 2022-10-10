import { Divider } from '@lib/ui/components/Divider';

import { useTheme } from '../hooks/useTheme';

/**
 * A divider element to separate list items with indentation
 */
export const IndentedDivider = () => {
  const { spacing } = useTheme();
  return <Divider style={{ marginStart: spacing[5] }} />;
};
