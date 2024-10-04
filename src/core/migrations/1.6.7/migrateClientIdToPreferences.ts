import 'react-native-get-random-values';
import * as Keychain from 'react-native-keychain';

import { v4 as uuidv4 } from 'uuid';

import { PreferencesContextProps } from '../../contexts/PreferencesContext';

export const migrateClientIdToPreferences = async (
  preferences: PreferencesContextProps,
) => {
  const { updatePreference } = preferences;
  try {
    const credentials = await Keychain.getGenericPassword();
    let clientId;
    if (credentials && credentials.username) {
      clientId = credentials.username;
    } else {
      clientId = uuidv4();
    }
    updatePreference('clientId', clientId);
  } catch (e) {
    console.warn(
      "Keychain couldn't be accessed! Failed to migrate clientId.",
      e,
    );
  }
};
