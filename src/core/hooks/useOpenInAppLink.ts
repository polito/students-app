import { useTheme } from '@lib/ui/hooks/useTheme.ts';

import * as WebBrowser from 'expo-web-browser';

export const useOpenInAppLink = () => {
  const { colors } = useTheme();

  return async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      showTitle: true,
      controlsColor: colors.headersBackground,
      toolbarColor: colors.headersBackground,
      secondaryToolbarColor: colors.headersBackground,
      enableBarCollapsing: true,
      showInRecents: true,
      readerMode: false,
    });
  };
};
