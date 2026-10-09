import { describe, it, expect } from 'vitest';
import {
  teaEncryptBlock,
  teaDecryptBlock,
  containerEncrypt,
  containerDecrypt,
  MacMachineInfoUtils,
} from '@/napcat-webui-backend/src/utils/guid';

// 参考实现: qq_guid_tool/macos (逆向自 macOS wrapper.node)
// 所有期望值均由该 Python 实现生成, 用于确保 TS 复刻逐字节一致。

const KEY = Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex');

function prefixRng (n: number): Buffer {
  return Buffer.from(Array.from({ length: n }, (_, i) => i));
}

function teaEncryptBlockG (block: Buffer, key = KEY): Buffer {
  return teaEncryptBlock(block, key);
}

function teaDecryptBlockG (block: Buffer, key = KEY): Buffer {
  return teaDecryptBlock(block, key);
}

describe('macOS TEA block', () => {
  it('encrypts blocks identical to the python reference', () => {
    expect(teaEncryptBlockG(Buffer.from('0001020304050607', 'hex')).toString('hex'))
      .toBe('6328a50896bde3c8');
    expect(teaEncryptBlockG(Buffer.from('ffffffffffffffff', 'hex')).toString('hex'))
      .toBe('c79e81a2904419de');
    expect(teaEncryptBlockG(Buffer.from('0011223344556677', 'hex')).toString('hex'))
      .toBe('205f515574f0821c');
  });

  it('decrypts the reference ciphertext', () => {
    expect(teaDecryptBlockG(Buffer.from('6328a50896bde3c8', 'hex')).toString('hex'))
      .toBe('0001020304050607');
  });

  it('round-trips blocks', () => {
    const block = Buffer.from('a1b2c3d4e5f60718', 'hex');
    expect(teaDecryptBlockG(teaEncryptBlockG(block)).equals(block)).toBe(true);
  });
});

describe('macOS TEA container', () => {
  it('matches the reference for "hello world" with a deterministic rng', () => {
    const blob = containerEncrypt(Buffer.from('hello world'), KEY, prefixRng);
    expect(blob.toString('hex'))
      .toBe('5e56df427ca3a4f56dfc8cbbd3438a437050558841226bb4');
    expect(containerDecrypt(blob, KEY)!.toString('hex')).toBe('68656c6c6f20776f726c64');
  });

  it('matches the reference for an empty payload', () => {
    const blob = containerEncrypt(Buffer.alloc(0), KEY, prefixRng);
    expect(blob.toString('hex')).toBe('b00e46ba3e788626272ec631c28ab195');
    expect(containerDecrypt(blob, KEY)!.length).toBe(0);
  });

  it('matches the reference for a 200 byte payload', () => {
    const payload = Buffer.from(Array.from({ length: 200 }, (_, i) => i));
    const blob = containerEncrypt(payload, KEY, prefixRng);
    const expected = 'b00e46ba3e788626bea151d61ae65f4ee433279c69c420d5e86f2e9d9844f335' +
      'fc3387a05609b7b3b294a99f8d5eb630e205a6b2d2778c01c2c860fc9b5cbcdaf07aacdece0b3a3' +
      '760245fae521f96422044562bc913ce1ac90456d810a981430ed54f7cec55207b85d6b5d991b1aa0f' +
      '4b033f9f8d2d86a06577c621d197a15c4c416efa3860f47b25bf71d8cfb6a08a6b3b158e1df47f950' +
      '911ab355be47101f37f989b0fe0c8afc432891f761aeadc29a78eabfc8a0bbef190028f85357cbf' +
      '489bb0c4a7353967dddb0254fa85f82122d4a003637bdc35';
    expect(blob.toString('hex')).toBe(expected);
    expect(containerDecrypt(blob, KEY)!.equals(payload)).toBe(true);
  });

  it('rejects a wrong key', () => {
    const blob = containerEncrypt(Buffer.from('hello world'), KEY, prefixRng);
    expect(containerDecrypt(blob, Buffer.alloc(16))).toBeNull();
  });
});

describe('macOS machineid-info', () => {
  // 真实样本: 取自 macOS 14.8.9 (x86_64 VM, IOPlatformUUID 全零),
  // 源文件 ~/Library/Containers/com.tencent.qq/Data/.../global/nt_data/msf/machineid-info
  const REAL_CIPHER = '062c59f4bd7972c3baeab0dd857d9482d57ecafe96b7ec4d566e416871d7e829' +
    '0d117016cd94f644ea968bc641bae40d';
  const REAL_PLAIN = '00000008525400c91827000000000014514d303030323120202020202020202020202020';
  const REAL_KEY_UUID = '00000000-0000-0000-0000-000000000000';

  it('decrypts a real QQ-generated machineid-info identically to the python reference', () => {
    const key = MacMachineInfoUtils.keyFromUuid(REAL_KEY_UUID);
    const plain = containerDecrypt(Buffer.from(REAL_CIPHER, 'hex'), key);
    expect(plain).not.toBeNull();
    expect(plain!.toString('hex')).toBe(REAL_PLAIN);
    const parsed = MacMachineInfoUtils.parseMachineIdInfo(plain!);
    expect(parsed.machineId.toString('hex')).toBe('525400c918270000');
    expect(parsed.sn).toBe('QM00021             ');
    expect(MacMachineInfoUtils.computeGuid(parsed.machineId, parsed.sn).toString('hex'))
      .toBe('110cac8ab81e1b7dca6e3f48b1127d92');
  });

  it('re-encrypts the real payload to a byte-identical container', () => {
    // 期望容器由参考 python 实现以相同 rng 生成
    const key = MacMachineInfoUtils.keyFromUuid(REAL_KEY_UUID);
    const plain = MacMachineInfoUtils.buildMachineIdInfo(
      Buffer.from('525400c918270000', 'hex'), 'QM00021             ');
    expect(plain.toString('hex')).toBe(REAL_PLAIN);
    const blob = containerEncrypt(plain, key, prefixRng);
    expect(blob.toString('hex'))
      .toBe('b73dfc91350349448b9ca9a255de7bffd75a548719ab4fa6311a439386fed1c29fbf7a40d0b77b1c7699d27d11545ca7');
  });

  it('builds and parses fields like the reference', () => {
    const plain = MacMachineInfoUtils.buildMachineIdInfo(
      Buffer.from('aabbccddeeff0011', 'hex'), 'C02TEST');
    expect(plain.toString('hex')).toBe('00000008aabbccddeeff00110000000743303254455354');
    const parsed = MacMachineInfoUtils.parseMachineIdInfo(plain);
    expect(parsed.machineId.toString('hex')).toBe('aabbccddeeff0011');
    expect(parsed.sn).toBe('C02TEST');
  });

  it('computes the reference guid', () => {
    const guid = MacMachineInfoUtils.computeGuid(Buffer.from('aabbccddeeff0011', 'hex'), 'C02TEST');
    expect(guid.toString('hex')).toBe('99902c9e4658f3495eac9932da8de575');
  });

  it('computes the MAC fallback guid', () => {
    const guid = MacMachineInfoUtils.computeGuid(
      Buffer.concat([Buffer.from('aabbccddeeff', 'hex'), Buffer.from([0, 0])]), 'C02TEST');
    expect(guid.toString('hex')).toBe('90daceec0ac283834cd1dba777e9d54a');
  });

  it('derives the TEA key from IOPlatformUUID', () => {
    expect(MacMachineInfoUtils.keyFromUuid('0F1E2D3C-4B5A-6978-8E9F-A0B1C2D3E4F5').toString('hex'))
      .toBe('30463145324433432d344235412d3639');
  });

  it('round-trips a container encrypt/decrypt', () => {
    const key = MacMachineInfoUtils.keyFromUuid('0F1E2D3C-4B5A-6978-8E9F-A0B1C2D3E4F5');
    const plain = MacMachineInfoUtils.buildMachineIdInfo(Buffer.from('0011223344556677', 'hex'), 'SN123456');
    const blob = containerEncrypt(plain, key);
    const back = containerDecrypt(blob, key);
    expect(back!.equals(plain)).toBe(true);
    const parsed = MacMachineInfoUtils.parseMachineIdInfo(back!);
    expect(parsed.machineId.toString('hex')).toBe('0011223344556677');
    expect(parsed.sn).toBe('SN123456');
  });
});
