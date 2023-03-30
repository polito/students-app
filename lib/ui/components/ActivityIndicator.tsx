import {
  ActivityIndicatorProps,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

import { IS_ANDROID } from '../../../src/core/constants';

export const ActivityIndicator = (props: ActivityIndicatorProps) => {
  const { colors } = useTheme();

  return (
    <RNActivityIndicator
      color={IS_ANDROID ? colors.secondary[600] : undefined}
      {...props}
    />
  );
};
