import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { Sha1Stream } from 'napcat-core/packet/utils/crypto/sha1Stream';

describe('Sha1Stream', () => {
  it('should compute correct SHA-1 hash for empty string', () => {
    const sha1Stream = new Sha1Stream();
    const hash = sha1Stream.final();
    const expected = crypto.createHash('sha1').update('').digest();
    expect(hash).toEqual(expected);
  });

  it('should compute correct SHA-1 hash for simple string', () => {
    const testData = 'Hello, World!';
    const sha1Stream = new Sha1Stream();
    sha1Stream.update(Buffer.from(testData));
    const hash = sha1Stream.final();
    const expected = crypto.createHash('sha1').update(testData).digest();
    expect(hash).toEqual(expected);
  });

  it('should compute correct SHA-1 hash for binary data', () => {
    const testData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
    const sha1Stream = new Sha1Stream();
    sha1Stream.update(testData);
    const hash = sha1Stream.final();
    const expected = crypto.createHash('sha1').update(testData).digest();
    expect(hash).toEqual(expected);
  });

  it('should handle multiple update calls', () => {
    const part1 = 'Hello';
    const part2 = ', World!';
    const sha1Stream = new Sha1Stream();
    sha1Stream.update(Buffer.from(part1));
    sha1Stream.update(Buffer.from(part2));
    const hash = sha1Stream.final();
    const expected = crypto.createHash('sha1').update(part1 + part2).digest();
    expect(hash).toEqual(expected);
  });

  it('should handle large data correctly', () => {
    const testData = crypto.randomBytes(1024 * 10); // 10KB random data
    const sha1Stream = new Sha1Stream();
    sha1Stream.update(testData);
    const hash = sha1Stream.final();
    const expected = crypto.createHash('sha1').update(testData).digest();
    expect(hash).toEqual(expected);
  });

  it('should produce consistent results for same input', () => {
    const testData = 'Consistent test data';

    const sha1Stream1 = new Sha1Stream();
    sha1Stream1.update(Buffer.from(testData));
    const hash1 = sha1Stream1.final();

    const sha1Stream2 = new Sha1Stream();
    sha1Stream2.update(Buffer.from(testData));
    const hash2 = sha1Stream2.final();

    expect(hash1).toEqual(hash2);
  });

  it('should handle edge case with exact block size', () => {
    // SHA-1 block size is 64 bytes
    const testData = 'a'.repeat(64);
    const sha1Stream = new Sha1Stream();
    sha1Stream.update(Buffer.from(testData));
    const hash = sha1Stream.final();
    const expected = crypto.createHash('sha1').update(testData).digest();
    expect(hash).toEqual(expected);
  });

  it('should handle random data correctly', () => {
    // Run multiple random tests (reduced from 100000 to 100 for performance)
    for (let i = 0; i < 100; i++) {
      const randomLength = Math.floor(Math.random() * 1024);
      const randomData = crypto.randomBytes(randomLength);
      const sha1Stream = new Sha1Stream();
      sha1Stream.update(randomData);
      const hash = sha1Stream.final();
      const expectedDigest = crypto.createHash('sha1').update(randomData).digest();
      expect(hash).toEqual(expectedDigest);
    }
  });
});