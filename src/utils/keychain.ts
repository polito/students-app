import { Platform } from 'react-native';
import Keychain, {
  AuthenticationPrompt,
  BaseOptions,
  GetOptions,
  SetOptions,
} from 'react-native-keychain';

const NO_TOKEN = '__EMPTY__';
const kcSettings: BaseOptions = { service: 'it.polito.students-app' };
const kcSessingsMfa: SetOptions | GetOptions = {
  service: 'it.polito.students-app.mfa',
  accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
};

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

export async function checkCanSavePrivateKeyMFA() {
  return Platform.select({
    android: Keychain.getSecurityLevel({
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    }).then(ret => ret !== null && ret !== Keychain.SECURITY_LEVEL.ANY),
    ios: Keychain.canImplyAuthentication({
      authenticationType:
        Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    }),
    default: Promise.resolve(false),
  });
}

export async function savePrivateKeyMFA(
  serial: string,
  privateKeyB64: string,
  authenticationPrompt: AuthenticationPrompt,
): Promise<boolean> {
  const privateKey = new AuthenticatorPrivKey(serial, privateKeyB64);

  await Keychain.setGenericPassword(serial, privateKey.serialize(), {
    ...kcSessingsMfa,
    authenticationPrompt,
  });
  return true;
}

export async function getPrivateKeyMFA(
  authenticationPrompt: AuthenticationPrompt,
): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({
    ...kcSessingsMfa,
    authenticationPrompt,
  });

  if (credentials !== false && credentials.password) {
    return credentials.password;
  }

  return null;
}

export async function resetPrivateKeyMFA(): Promise<void> {
  await Keychain.resetGenericPassword({ service: kcSessingsMfa.service });
}
