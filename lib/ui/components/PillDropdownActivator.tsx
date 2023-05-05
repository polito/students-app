import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { PillButton, PillButtonProps } from '@lib/ui/components/Pill';
import { Row } from '@lib/ui/components/Row';
import { useTheme } from '@lib/ui/hooks/useTheme';

export type PillDropdownActivatorProps = PillButtonProps;

export const PillDropdownActivator = ({
  children,
  ...props
}: PillDropdownActivatorProps) => {
  const { fontSizes } = useTheme();

  return (
    <PillButton {...props}>
      <Row gap={2} align="center">
        {children}
        <Icon icon={faChevronDown} size={fontSizes.xs} />
      </Row>
    </PillButton>
  );
};
