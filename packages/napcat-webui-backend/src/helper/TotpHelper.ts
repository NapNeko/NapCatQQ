import crypto from 'crypto';

export class TotpHelper {
  private static readonly DEFAULT_DIGITS = 6;
  private static readonly DEFAULT_PERIOD = 30;
  private static readonly HASH_ALGORITHM = 'sha1';
  private static readonly BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  public static generateSecret (length: number = 16): string {
    const bytes = crypto.randomBytes(length);
    let result = '';
    let buffer = 0;
    let bitsLeft = 0;

    for (let i = 0; i < bytes.length; i++) {
      buffer = (buffer << 8) | bytes[i];
      bitsLeft += 8;

      while (bitsLeft >= 5) {
        bitsLeft -= 5;
        result += TotpHelper.BASE32_CHARS[(buffer >> bitsLeft) & 0x1F];
      }
    }

    if (bitsLeft > 0) {
      result += TotpHelper.BASE32_CHARS[(buffer << (5 - bitsLeft)) & 0x1F];
    }

    return result;
  }

  public static generateTotp (secret: string, timestamp: number = Date.now()): string {
    const period = TotpHelper.DEFAULT_PERIOD;
    const digits = TotpHelper.DEFAULT_DIGITS;
    const algorithm = TotpHelper.HASH_ALGORITHM;

    const counter = Math.floor(timestamp / 1000 / period);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    counterBuffer.writeUInt32BE(counter & 0xFFFFFFFF, 4);

    const decodedSecret = TotpHelper.base32Decode(secret);
    const hmac = crypto.createHmac(algorithm, decodedSecret);
    hmac.update(counterBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0F;
    const binary = (hash[offset] & 0x7F) << 24 |
                   (hash[offset + 1] & 0xFF) << 16 |
                   (hash[offset + 2] & 0xFF) << 8 |
                   (hash[offset + 3] & 0xFF);

    const otp = binary % Math.pow(10, digits);
    return otp.toString().padStart(digits, '0');
  }

  public static verifyTotp (secret: string, token: string, window: number = 1): boolean {
    const currentTime = Date.now();
    const period = TotpHelper.DEFAULT_PERIOD;

    for (let i = -window; i <= window; i++) {
      const timestamp = currentTime + (i * period * 1000);
      const generatedToken = TotpHelper.generateTotp(secret, timestamp);
      if (generatedToken === token) {
        return true;
      }
    }
    return false;
  }

  public static generateQrCodeUrl (secret: string, label: string = 'NapCat WebUI', issuer: string = 'NapCat'): string {
    const encodedLabel = encodeURIComponent(label);
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedSecret = encodeURIComponent(secret);
    return `otpauth://totp/${encodedLabel}?secret=${encodedSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  private static base32Decode (encoded: string): Buffer {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    encoded = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '');

    for (let i = 0; i < encoded.length; i++) {
      const index = base32Chars.indexOf(encoded[i]);
      if (index === -1) {
        throw new Error('Invalid base32 character');
      }
      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        bits -= 8;
        output.push((value >>> bits) & 0xFF);
      }
    }

    return Buffer.from(output);
  }
}