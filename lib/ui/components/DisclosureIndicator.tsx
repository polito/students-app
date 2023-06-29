import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const DisclosureIndicator = () => {
  const { colors, spacing } = useTheme();

  return (
    <Icon
      icon={faChevronRight}
      color={colors.secondaryText}
      style={{
        marginLeft: spacing[1],
        marginRight: -spacing[1],
      }}
    />
  );
};
