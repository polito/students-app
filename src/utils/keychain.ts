import Keychain from 'react-native-keychain';

const NO_TOKEN = '__EMPTY__';
const kcSettings: Keychain.Options = { service: 'it.polito.students-app' };
const MFA_SERVICE = 'it.polito.students-app.mfa';

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

export async function savePrivateKeyMFA(
  serial: string,
  privateKeyB64: string,
): Promise<boolean> {
  try {
    const privateKey = {
      serial: serial,
      privateKeyB64: privateKeyB64,
      type: 'secp256k1',
    };

    await Keychain.setGenericPassword('mfa-key', JSON.stringify(privateKey), {
      service: MFA_SERVICE,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      authenticationPrompt: {
        title: 'Autenticazione richiesta per salvare la chiave MFA',
      },
    });
    return true;
  } catch (error) {
    console.error('Errore salvataggio chiave MFA:', error);
    return false;
  }
}

export async function getPrivateKeyMFA(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: MFA_SERVICE,
      authenticationPrompt: {
        title: 'Autenticati per accedere alla chiave MFA',
      },
    });

    if (credentials !== false && credentials.password) {
      return credentials.password;
    }

    return null;
  } catch (error) {
    console.error('Errore recupero chiave MFA:', error);
    return null;
  }
}

export async function resetPrivateKeyMFA(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: MFA_SERVICE });
  } catch (error) {
    console.error('Errore reset chiave MFA:', error);
  }
}
