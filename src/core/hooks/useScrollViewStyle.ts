import { useTheme } from '@lib/ui/hooks/useTheme';
import { useHeaderHeight } from '@react-navigation/elements';

export const useScrollViewStyle = () => {
  const headerHeight = useHeaderHeight();
  const { spacing } = useTheme();

  return {
    marginTop: headerHeight + Number(spacing['2']),
  };
};
