import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  StatusBar,
  StatusBarStyle,
} from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import { Theme } from '@lib/ui/types/Theme.ts';

const sleep = (timeout: number) =>
  new Promise<void>(resolve => setTimeout(resolve, timeout));

export const openLink = async (
  url: string,
  statusBarStyle: StatusBarStyle,
  colors: Theme['colors'],
  animated = true,
) => {
  try {
    const { width, height } = Dimensions.get('window');
    if (await InAppBrowser.isAvailable()) {
      // A delay to change the StatusBar when the browser is opened
      const delay = animated && Platform.OS === 'ios' ? 400 : 0;
      setTimeout(() => StatusBar.setBarStyle('light-content'), delay);
      await InAppBrowser.open(url, {
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: colors.headersBackground,
        preferredControlTintColor: 'white',
        readerMode: true,
        animated,
        modalPresentationStyle: 'formSheet',
        modalTransitionStyle: 'flipHorizontal',
        modalEnabled: true,
        enableBarCollapsing: true,
        formSheetPreferredContentSize: {
          width: width - width / 6,
          height: height - height / 6,
        },
        // Android Properties
        showTitle: true,
        toolbarColor: colors.headersBackground,
        secondaryToolbarColor: 'red',
        navigationBarColor: colors.headersBackground,
        navigationBarDividerColor: 'white',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: true,
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
        hasBackButton: false,
        browserPackage: undefined,
        showInRecents: true,
        includeReferrer: true,
      });
    } else {
      Linking.openURL(url);
    }
  } catch (error) {
    await sleep(50);
    // console.log(error);
    const errorMessage = (error as Error).message || (error as string);
    Alert.alert(errorMessage);
  } finally {
    StatusBar.setBarStyle(statusBarStyle);
  }
};

/*

TODO implement deep link for SSO

export const getDeepLink = (path = '') => {
  const scheme = 'my-demo';
  const prefix =
    Platform.OS === 'android' ? `${scheme}://demo/` : `${scheme}://`;
  return prefix + path;
};

export const tryDeepLinking = async () => {
  const loginUrl = 'https://proyecto26.github.io/react-native-inappbrowser/';
  const redirectUrl = getDeepLink();
  const url = `${loginUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`;
  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.openAuth(url, redirectUrl, {
        // iOS Properties
        ephemeralWebSession: false,
        // Android Properties
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
      });
      await sleep(800);
      Alert.alert('Response', JSON.stringify(result));
    } else {
      Alert.alert('InAppBrowser is not supported :/');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Something’s wrong with the app :(');
  }
};

 */
