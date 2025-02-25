import Keychain from 'react-native-keychain';

const NO_TOKEN = '__EMPTY__';
const kcSettings = { service: 'it.polito.students-app' };

export interface KeychainServiceCredentials {
  username: string;
  password?: string | null;
}

export async function resetCredentials(): Promise<void> {
  const credentials = await Keychain.getGenericPassword(kcSettings);
  if (credentials) {
    await Keychain.resetGenericPassword(kcSettings);
    await Keychain.setGenericPassword(
      credentials.username,
      NO_TOKEN,
      kcSettings,
    );
  }
}

export async function getCredentials(): Promise<
  KeychainServiceCredentials | false
> {
  const credentials = await Keychain.getGenericPassword(kcSettings);
  if (!credentials) {
    return false;
  }
  if (credentials.password === NO_TOKEN) {
    return { ...credentials, password: null };
  }
  return credentials;
}

export async function setCredentials(
  value: KeychainServiceCredentials,
): Promise<void> {
  if (value.username) {
    if (value.password) {
      await Keychain.setGenericPassword(
        value.username,
        value.password,
        kcSettings,
      );
    }
    await Keychain.setGenericPassword(value.username, NO_TOKEN, kcSettings);
  }
}
