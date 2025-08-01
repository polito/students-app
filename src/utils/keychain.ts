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

export class AuthenticatorPrivKey {
  constructor(
    public readonly serial: string,
    public readonly privateKeyB64: string,
    public readonly type: 'secp256k1' = 'secp256k1',
  ) {}

  serialize(): string {
    return JSON.stringify({
      serial: this.serial,
      privateKeyB64: this.privateKeyB64,
      type: this.type,
    });
  }

  static fromJSON(json: string): AuthenticatorPrivKey {
    const data = JSON.parse(json) as AuthenticatorPrivKey;
    return new AuthenticatorPrivKey(data.serial, data.privateKeyB64, data.type);
  }
}

export async function savePrivateKeyMFA(
  serial: string,
  privateKeyB64: string,
  authenticationPrompt: Keychain.AuthenticationPrompt,
): Promise<boolean> {
  try {
    const privateKey = new AuthenticatorPrivKey(serial, privateKeyB64);

    await Keychain.setGenericPassword('mfa-key', privateKey.serialize(), {
      service: MFA_SERVICE,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      authenticationPrompt,
    });
    return true;
  } catch (error) {
    console.error('Error while saving MFA private key', error);
    return false;
  }
}

export async function getPrivateKeyMFA(
  authenticationPrompt: Keychain.AuthenticationPrompt,
): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: MFA_SERVICE,
      authenticationPrompt,
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
