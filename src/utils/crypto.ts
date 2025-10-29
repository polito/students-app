import 'react-native-get-random-values';

import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';

import { BitString, ObjectIdentifier, Sequence } from 'asn1js';
import base32Encode from 'base32-encode';
// ts/linter does not complain without Buffer, but it's needed at runtime
import { Buffer } from 'buffer';

import { AuthenticatorPrivKey } from './keychain';

export const generateSecp256k1PrivKey = () => secp256k1.utils.randomSecretKey();

export const generateSecp256k1KeyPair = () => {
  const pemOUT = (key: any) => Buffer.from(key.toBER(false)).toString('base64');

  const privKey = generateSecp256k1PrivKey();
  const pubKey = secp256k1.getPublicKey(privKey);

  const publicKeyInfo = new Sequence({
    value: [
      new Sequence({
        value: [
          new ObjectIdentifier({ value: '1.2.840.10045.2.1' }),
          new ObjectIdentifier({ value: '1.3.132.0.10' }),
        ],
      }),
      new BitString({
        unusedBits: 0,
        valueHex: pubKey.buffer as ArrayBuffer,
      }),
    ],
  });

  const privKeyB64 = Buffer.from(privKey).toString('base64');
  const pubKeyPEM = pemOUT(publicKeyInfo);

  return {
    privateKey: privKeyB64,
    publicKey: pubKeyPEM,
  };
};

export function signSecp256k1(
  nonce: string,
  pk: AuthenticatorPrivKey,
  decline: boolean = false,
): string {
  if (pk.type !== 'secp256k1') {
    throw new Error(`Unsupported key type: ${pk.type}`);
  }

  const privKey = new Uint8Array(Buffer.from(pk.privateKeyB64, 'base64'));

  if (!secp256k1.utils.isValidSecretKey(privKey)) {
    throw new Error('Invalid private key');
  }

  const messageParts = [nonce, pk.serial];
  if (decline) {
    messageParts.push('decline');
  }
  const message = new TextEncoder().encode(messageParts.join('|'));
  const digest = sha256(message);

  const der = secp256k1.sign(digest, privKey, { format: 'der' });
  const signature = base32Encode(der, 'RFC4648');

  return signature;
}
