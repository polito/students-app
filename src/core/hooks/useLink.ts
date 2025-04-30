import { useCallback, useState } from 'react';
import { StatusBarStyle } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme.ts';

import { openLink } from '../../utils/link.ts';

export const useLink = (url: string) => {
  const [statusBarStyle] = useState<StatusBarStyle>('dark-content');
  const { colors } = useTheme();

  return useCallback(async () => {
    await openLink(url, statusBarStyle, colors);
  }, [colors, statusBarStyle, url]);
};
