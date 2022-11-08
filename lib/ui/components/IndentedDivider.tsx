import { Divider } from '@lib/ui/components/Divider';

/**
 * A divider element to separate list items with indentation
 */
export const IndentedDivider = ({ indent = 56 }) => {
  return <Divider style={{ marginStart: indent }} />;
};
