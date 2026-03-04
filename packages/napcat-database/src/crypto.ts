/**
 *   密钥派生
 *   enc_key  = PBKDF2_HMAC_SHA512(passphrase, salt, 4000, 32)
 *   hmac_key = PBKDF2_HMAC_SHA512(enc_key, salt ^ 0x3a, 2, 32)
 */

import { pbkdf2Sync } from 'node:crypto';
import {
  KEY_SIZE,
  KDF_ITERATIONS,
  FAST_ITERATIONS,
  HMAC_MASK,
} from './constants';

export interface DerivedKeys {
  encKey: Buffer;
  hmacKey: Buffer;
}
export function deriveKeys (passphrase: Buffer, salt: Buffer): DerivedKeys {
  const encKey = pbkdf2Sync(passphrase, salt, KDF_ITERATIONS, KEY_SIZE, 'sha512');

  const hmacSalt = Buffer.alloc(salt.length);
  for (let i = 0; i < salt.length; i++) {
    hmacSalt[i] = salt[i]! ^ HMAC_MASK;
  }
  const hmacKey = pbkdf2Sync(encKey, hmacSalt, FAST_ITERATIONS, KEY_SIZE, 'sha512');

  return { encKey, hmacKey };
}
