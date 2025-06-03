import { useCallback } from 'react';

import { useTheme } from '@lib/ui/hooks/useTheme.ts';

import * as WebBrowser from 'expo-web-browser';

export const useOpenInAppLink = () => {
  const { colors } = useTheme();

  return useCallback(
    async (url: string) => {
      await WebBrowser.openBrowserAsync(url, {
        showTitle: true,
        controlsColor: colors.link,
        toolbarColor: colors.headersBackground,
        secondaryToolbarColor: colors.headersBackground,
        enableBarCollapsing: true,
        showInRecents: true,
        readerMode: false,
      });
    },
    [colors],
  );
};
