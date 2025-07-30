import 'react-native-get-random-values';

import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha2';

import { BitString, ObjectIdentifier, Sequence } from 'asn1js';
import base32Encode from 'base32-encode';

export const keyGenerator = () => {
  const pemOUT = (key: any) => Buffer.from(key.toBER(false)).toString('base64');

  const privKey = secp256k1.utils.randomSecretKey();
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
        valueHex: pubKey.buffer,
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

export function authSign(
  serial: string,
  nonce: string,
  privateKeyB64: string,
): string {
  const privKey = new Uint8Array(Buffer.from(privateKeyB64, 'base64'));

  if (!secp256k1.utils.isValidSecretKey(privKey)) {
    throw new Error('Invalid private key');
  }

  const message = new TextEncoder().encode(`${nonce}|${serial}`);
  const digest = sha256(message);

  const der = secp256k1.sign(digest, privKey).toBytes('der');
  const signature = base32Encode(der, 'RFC4648');

  return signature;
}
