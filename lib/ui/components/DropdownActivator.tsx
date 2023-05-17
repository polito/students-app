import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { useTheme } from '../hooks/useTheme';
import { Icon } from './Icon';
import { Row, RowProps } from './Row';

export type DropdownActivatorProps = RowProps;

export const DropdownActivator = ({
  children,
  ...props
}: DropdownActivatorProps) => {
  const { fontSizes } = useTheme();
  return (
    <Row gap={2} align="center" {...props}>
      {children}
      <Icon icon={faChevronDown} size={fontSizes.xs} />
    </Row>
  );
};
