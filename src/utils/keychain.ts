import Keychain from 'react-native-keychain';

const NO_TOKEN = '__EMPTY__';
const kcSettings: Keychain.Options = { service: 'it.polito.students-app' };

export interface KeychainServiceCredentials {
  username: string;
  password?: string | null;
}

export async function resetCredentials(): Promise<void> {
  const credentials = await Keychain.getGenericPassword(kcSettings);
  if (credentials) {
    await Keychain.resetGenericPassword(kcSettings);
    await setCredentials(credentials.username, NO_TOKEN);
  }
}

export async function getCredentials(): Promise<
  KeychainServiceCredentials | false
> {
  const credentials = await Keychain.getGenericPassword(kcSettings);
  if (credentials && credentials.password === NO_TOKEN) {
    return { ...credentials, password: null };
  }
  return credentials;
}

export async function setCredentials(
  username: string,
  password: string | null = null,
): Promise<boolean> {
  return !!(await Keychain.setGenericPassword(
    username,
    password || NO_TOKEN,
    kcSettings,
  ));
}
