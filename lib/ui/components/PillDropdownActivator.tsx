import { PillButton, PillButtonProps } from '@lib/ui/components/PillButton';

import { DropdownActivator } from './DropdownActivator';

export type PillDropdownActivatorProps = PillButtonProps;

export const PillDropdownActivator = ({
  children,
  ...props
}: PillDropdownActivatorProps) => {
  return (
    <PillButton {...props}>
      <DropdownActivator>{children}</DropdownActivator>
    </PillButton>
  );
};
