import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { promises as fs } from 'fs';
import path from 'path';
import { webUiPathWrapper } from '../../index';

interface PasskeyCredential {
  id: string;
  publicKey: string;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
}

const RP_NAME = 'NapCat WebUI';

export class PasskeyHelper {
  private static getPasskeyFilePath (): string {
    return path.join(webUiPathWrapper.configPath, 'passkey.json');
  }

  // 内存中存储临时挑战数据
  private static challenges: Map<string, string> = new Map();
  private static async ensurePasskeyFile (): Promise<void> {
    try {
      // 确保配置文件目录存在
      const passkeyFile = this.getPasskeyFilePath();
      await fs.mkdir(path.dirname(passkeyFile), { recursive: true });
      // 检查文件是否存在，如果不存在创建空文件
      try {
        await fs.access(passkeyFile);
      } catch {
        await fs.writeFile(passkeyFile, JSON.stringify({}, null, 2));
      }
    } catch (_error) {
      // Directory or file already exists or other error
    }
  }

  private static async getAllPasskeys (): Promise<Record<string, PasskeyCredential[]>> {
    await this.ensurePasskeyFile();
    try {
      const passkeyFile = this.getPasskeyFilePath();
      const data = await fs.readFile(passkeyFile, 'utf-8');
      const passkeys = JSON.parse(data);
      return typeof passkeys === 'object' && passkeys !== null ? passkeys : {};
    } catch (_error) {
      console.error('Failed to read passkey file:', _error);
      return {};
    }
  }

  private static async saveAllPasskeys (allPasskeys: Record<string, PasskeyCredential[]>): Promise<void> {
    await this.ensurePasskeyFile();
    const passkeyFile = this.getPasskeyFilePath();
    await fs.writeFile(passkeyFile, JSON.stringify(allPasskeys, null, 2));
  }

  private static async getUserPasskeys (userId: string): Promise<PasskeyCredential[]> {
    const allPasskeys = await this.getAllPasskeys();
    return allPasskeys[userId] || [];
  }

  // 持久性存储用户的passkey到统一配置文件
  private static async setUserPasskeys (userId: string, passkeys: PasskeyCredential[]): Promise<void> {
    const allPasskeys = await this.getAllPasskeys();
    if (passkeys.length > 0) {
      allPasskeys[userId] = passkeys;
    } else {
      delete allPasskeys[userId];
    }
    await this.saveAllPasskeys(allPasskeys);
  }

  static async generateRegistrationOptions (userId: string, userName: string, rpId: string) {
    const userPasskeys = await this.getUserPasskeys(userId);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: rpId,
      userID: new TextEncoder().encode(userId) as Uint8Array<ArrayBuffer>,
      userName,
      attestationType: 'none',
      excludeCredentials: userPasskeys.map(passkey => ({
        id: passkey.id,
        type: 'public-key' as const,
        transports: passkey.transports,
      })),
      // Temporarily simplify authenticatorSelection - remove residentKey to avoid conflicts
      authenticatorSelection: {
        userVerification: 'preferred',
      },
    });

    // Store challenge temporarily in memory
    this.challenges.set(`reg_${userId}`, options.challenge);
    // Auto cleanup after 5 minutes
    setTimeout(() => {
      this.challenges.delete(`reg_${userId}`);
    }, 300000);

    return options;
  }

  static async verifyRegistration (userId: string, response: any, origin: string, rpId: string) {
    const expectedChallenge = this.challenges.get(`reg_${userId}`);
    if (!expectedChallenge) {
      throw new Error('Challenge not found or expired');
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
    });

    if (verification.verified && verification.registrationInfo) {
      const { registrationInfo } = verification;

      const newPasskey: PasskeyCredential = {
        id: registrationInfo.credential.id,
        publicKey: isoBase64URL.fromBuffer(registrationInfo.credential.publicKey),
        counter: registrationInfo.credential.counter || 0,
        transports: response.response.transports,
      };

      const userPasskeys = await this.getUserPasskeys(userId);
      userPasskeys.push(newPasskey);
      await this.setUserPasskeys(userId, userPasskeys);

      // Clean up challenge
      this.challenges.delete(`reg_${userId}`);
    }

    return verification;
  }

  static async generateAuthenticationOptions (userId: string, rpId: string) {
    const userPasskeys = await this.getUserPasskeys(userId);

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials: userPasskeys.map(passkey => ({
        id: passkey.id,
        type: 'public-key' as const,
        transports: passkey.transports,
      })),
      userVerification: 'preferred',
    });

    // Store challenge temporarily in memory
    this.challenges.set(`auth_${userId}`, options.challenge);
    // Auto cleanup after 5 minutes
    setTimeout(() => {
      this.challenges.delete(`auth_${userId}`);
    }, 300000);

    return options;
  }

  static async verifyAuthentication (userId: string, response: any, origin: string, rpId: string) {
    const expectedChallenge = this.challenges.get(`auth_${userId}`);
    if (!expectedChallenge) {
      throw new Error('Challenge not found or expired');
    }

    const userPasskeys = await this.getUserPasskeys(userId);
    const passkey = userPasskeys.find(p => p.id === response.id);
    if (!passkey) {
      throw new Error('Passkey not found');
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      credential: {
        id: passkey.id,
        publicKey: isoBase64URL.toBuffer(passkey.publicKey),
        counter: passkey.counter,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      // Update counter
      passkey.counter = verification.authenticationInfo.newCounter;
      await this.setUserPasskeys(userId, userPasskeys);

      // Clean up challenge
      this.challenges.delete(`auth_${userId}`);
    }

    return verification;
  }

  static async hasPasskeys (userId: string): Promise<boolean> {
    const userPasskeys = await this.getUserPasskeys(userId);
    return userPasskeys.length > 0;
  }
}
