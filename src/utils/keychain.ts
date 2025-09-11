import { Platform } from 'react-native';
import Keychain, {
  AuthenticationPrompt,
  BaseOptions,
  GetOptions,
  SetOptions,
  hasGenericPassword,
} from 'react-native-keychain';

const NO_TOKEN = '__EMPTY__';
const kcSettings: BaseOptions = { service: 'it.polito.students-app' };
const kcSessingsMfa: SetOptions | GetOptions = {
  service: 'it.polito.students-app.mfa',
  accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
  accessControl: Platform.select({
    android: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    // on ios BIOMETRY_ANY_OR_DEVICE_PASSCODE is done as weird combination
    // to reach the same behavior that should have USER_PRESENCE
    // but it doesn't work. USER_PRESENCE seems not to be implemented for Android
    ios: Keychain.ACCESS_CONTROL.USER_PRESENCE,
  }),
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
  await resetPrivateKeyMFA();
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
  return Keychain.isPasscodeAuthAvailable();
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

export async function hasPrivateKeyMFA(): Promise<boolean> {
  const [isPasscodeAvailable, hasPassword] = await Promise.all([
    Keychain.isPasscodeAuthAvailable(),
    hasGenericPassword(kcSessingsMfa),
  ]);

  return isPasscodeAvailable && hasPassword;
}
