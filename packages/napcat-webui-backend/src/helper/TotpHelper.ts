import crypto from 'crypto';

/**
 * TOTP (Time-based One-Time Password) Helper
 * 用于生成和验证基于时间的一次性密码
 */
export class TotpHelper {
  /**
   * 生成随机密钥（Base32格式）
   * @param length 密钥长度（字节），默认16字节
   * @returns Base32编码的密钥
   */
  static generateSecret(length: number = 16): string {
    const buffer = crypto.randomBytes(length);
    return this.toBase32(buffer);
  }

  /**
   * 验证一次性密码
   * @param secret Base32编码的密钥
   * @param code 用户输入的验证码
   * @param timeStep 时间步长（秒），默认30秒
   * @param window 允许的时间窗口（前后各多少个时间步长），默认1
   * @returns 是否验证通过
   */
  static verifyTotp(
    secret: string,
    code: string,
    timeStep: number = 30,
    window: number = 1
  ): boolean {
    const time = Math.floor(Date.now() / 1000 / timeStep);

    // 检查前后 window 个时间步长
    for (let i = -window; i <= window; i++) {
      const candidateCode = this.generateHotp(secret, time + i);
      if (candidateCode === code) {
        return true;
      }
    }
    return false;
  }

  /**
   * 生成 HOTP (HMAC-based One-Time Password)
   * @param secret Base32编码的密钥
   * @param counter 计数器
   * @returns 6位数字验证码
   */
  private static generateHotp(secret: string, counter: number): string {
    // 将 Base32 密钥转换为字节
    const key = this.base32ToBytes(secret);

    // 将计数器转换为 8 字节大端序
    const counterBytes = Buffer.alloc(8);
    let tempCounter = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = tempCounter & 0xff;
      tempCounter = Math.floor(tempCounter / 256);
    }

    // 计算 HMAC-SHA1
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(counterBytes);
    const hash = hmac.digest();

    // 动态截断
    const hashLength = hash.length;
    const lastByte = hash[hashLength - 1];
    if (lastByte === undefined) {
      return '000000';
    }
    const offset = lastByte & 0x0f;
    const byte0 = hash[offset] ?? 0;
    const byte1 = hash[offset + 1] ?? 0;
    const byte2 = hash[offset + 2] ?? 0;
    const byte3 = hash[offset + 3] ?? 0;
    const binary =
      ((byte0 & 0x7f) << 24) |
      ((byte1 & 0xff) << 16) |
      ((byte2 & 0xff) << 8) |
      (byte3 & 0xff);

    // 生成 6 位数字
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  /**
   * 生成 QR Code URL
   * @param secret Base32编码的密钥
   * @param account 账户名称
   * @param issuer 发行方名称
   * @returns otpauth:// URL
   */
  static generateQrCodeUrl(
    secret: string,
    account: string,
    issuer: string
  ): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedAccount = encodeURIComponent(`${issuer}:${account}`);
    return `otpauth://totp/${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * 将字节数组转换为 Base32 编码
   * @param buffer 字节数组
   * @returns Base32编码字符串
   */
  private static toBase32(buffer: Buffer): string {
    const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let output = '';

    for (let i = 0; i < buffer.length; i += 5) {
      const b0 = buffer[i] ?? 0;
      const b1 = buffer[i + 1] ?? 0;
      const b2 = buffer[i + 2] ?? 0;
      const b3 = buffer[i + 3] ?? 0;
      const b4 = buffer[i + 4] ?? 0;

      output += base32Alphabet[(b0 >> 3) & 0x1f];
      output += base32Alphabet[((b0 << 2) | (b1 >> 6)) & 0x1f];
      output += base32Alphabet[(b1 >> 1) & 0x1f];
      output += base32Alphabet[((b1 << 4) | (b2 >> 4)) & 0x1f];
      output += base32Alphabet[((b2 << 1) | (b3 >> 7)) & 0x1f];
      output += base32Alphabet[(b3 >> 2) & 0x1f];
      output += base32Alphabet[((b3 << 3) | (b4 >> 5)) & 0x1f];
      output += base32Alphabet[b4 & 0x1f];
    }

    // 移除填充的等号
    return output.replace(/=+$/, '');
  }

  /**
   * 将 Base32 字符串转换为字节数组
   * @param base32 Base32编码字符串
   * @returns 字节数组
   */
  private static base32ToBytes(base32: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const base32Clean = base32.toUpperCase().replace(/=+$/, '');

    const bytes: number[] = [];
    let buffer = 0;
    let bitsLeft = 0;

    for (const char of base32Clean) {
      const value = alphabet.indexOf(char);
      if (value === -1) continue;

      buffer = (buffer << 5) | value;
      bitsLeft += 5;

      if (bitsLeft >= 8) {
        bytes.push((buffer >> (bitsLeft - 8)) & 0xff);
        bitsLeft -= 8;
      }
    }

    return Buffer.from(bytes);
  }
}
