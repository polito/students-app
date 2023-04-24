import { Divider } from '@lib/ui/components/Divider';

interface Props {
  indent?: number;
}

/**
 * A divider element to separate list items with indentation
 */
export const IndentedDivider = ({ indent = 56 }: Props) => {
  return <Divider style={{ marginStart: indent }} />;
};
