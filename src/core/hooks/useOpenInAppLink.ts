import { useCallback } from 'react';
import { Linking } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme.ts';

import * as WebBrowser from 'expo-web-browser';

import { IS_IOS } from '../constants';

export enum WebviewType {
  NORMAL,
  LOGIN,
}

export const useOpenInAppLink = (type: WebviewType = WebviewType.NORMAL) => {
  const { colors } = useTheme();

  return useCallback(
    async (url: string) => {
      const opts:
        | WebBrowser.AuthSessionOpenOptions
        | WebBrowser.WebBrowserOpenOptions = {
        showTitle: true,
        controlsColor: colors.link,
        toolbarColor: colors.headersBackground,
        secondaryToolbarColor: colors.headersBackground,
        enableBarCollapsing: true,
        showInRecents: true,
        readerMode: false,
      };
      if (type === WebviewType.LOGIN) {
        const out = (await WebBrowser.openAuthSessionAsync(
          url,
          null,
          opts,
        )) as WebBrowser.WebBrowserRedirectResult;
        if (IS_IOS && out.url) {
          Linking.openURL(out.url);
        }
      } else {
        await WebBrowser.openBrowserAsync(url, opts);
      }
    },
    [colors, type],
  );
};
