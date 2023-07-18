import { Divider, DividerProps } from '@lib/ui/components/Divider';

interface IndentedDividerProps extends DividerProps {
  indent?: number;
}

/**
 * A divider element to separate list items with indentation
 */
export const IndentedDivider = ({
  indent = 56,
  style,
  ...props
}: IndentedDividerProps) => {
  return <Divider {...props} style={[{ marginStart: indent }, style]} />;
};
