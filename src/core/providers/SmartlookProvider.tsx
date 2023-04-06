import { PropsWithChildren, useEffect } from 'react';
import Smartlook, {
  SmartlookRenderingMode,
} from 'react-native-smartlook-analytics';

import { SMARTLOOK_API_KEY } from '@env';

import { usePreferencesContext } from '../contexts/PreferencesContext';

export const SmartlookProvider = ({ children }: PropsWithChildren) => {
  const { shouldRecordScreen } = usePreferencesContext();

  Promise.all([
    Smartlook.instance.preferences.setProjectKey(SMARTLOOK_API_KEY),
    Smartlook.instance.state.setRenderingMode(
      SmartlookRenderingMode.NoRendering,
    ),
  ]).then(() => Smartlook.instance.start());

  useEffect(() => {
    Smartlook.instance.state.getRenderingMode().then(currentMode => {
      const nextMode = shouldRecordScreen
        ? SmartlookRenderingMode.Native
        : SmartlookRenderingMode.NoRendering;

      if (currentMode !== nextMode.toString()) {
        return Smartlook.instance.state
          .setRenderingMode(nextMode)
          .then(() => Smartlook.instance.user.openNewSession());
      }
    });
  }, [shouldRecordScreen]);
  return children;
};
