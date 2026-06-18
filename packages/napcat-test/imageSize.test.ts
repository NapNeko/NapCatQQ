import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  detectImageTypeFromBuffer,
  imageSizeFromBuffer,
  imageSizeFromBufferFallBack,
  imageSizeFromFile,
  matchMagic,
  ImageType,
} from '@/napcat-image-size/src';

// resource 目录路径
const resourceDir = path.resolve(__dirname, '../napcat-image-size/resource');

// 测试用的 Buffer 数据
const testBuffers = {
  // PNG 测试图片 (100x200)
  png: Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0xC8,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]),

  // JPEG 测试图片 (320x240)
  jpeg: Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10,
    0x4A, 0x46, 0x49, 0x46, 0x00,
    0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0xFF, 0xC0, 0x00, 0x0B, 0x08,
    0x00, 0xF0, 0x01, 0x40, 0x03, 0x01, 0x22, 0x00,
  ]),

  // BMP 测试图片 (640x480)
  bmp: (() => {
    const buf = Buffer.alloc(54);
    buf.write('BM', 0);
    buf.writeUInt32LE(54, 2);
    buf.writeUInt32LE(0, 6);
    buf.writeUInt32LE(54, 10);
    buf.writeUInt32LE(40, 14);
    buf.writeUInt32LE(640, 18);
    buf.writeUInt32LE(480, 22);
    buf.writeUInt16LE(1, 26);
    buf.writeUInt16LE(24, 28);
    return buf;
  })(),

  // GIF87a 测试图片 (800x600)
  gif87a: Buffer.from([
    0x47, 0x49, 0x46, 0x38, 0x37, 0x61,
    0x20, 0x03, 0x58, 0x02, 0x00, 0x00, 0x00,
  ]),

  // GIF89a 测试图片 (1024x768)
  gif89a: Buffer.from([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
    0x00, 0x04, 0x00, 0x03, 0x00, 0x00, 0x00,
  ]),

  // WebP VP8 测试图片 (1920x1080)
  webpVP8: (() => {
    const buf = Buffer.alloc(32);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(24, 4);
    buf.write('WEBP', 8);
    buf.write('VP8 ', 12);
    buf.writeUInt32LE(14, 16);
    buf.writeUInt8(0x9D, 20);
    buf.writeUInt8(0x01, 21);
    buf.writeUInt8(0x2A, 22);
    buf.writeUInt16LE(1920 & 0x3FFF, 26);
    buf.writeUInt16LE(1080 & 0x3FFF, 28);
    return buf;
  })(),

  // WebP VP8L 测试图片 (256x128)
  webpVP8L: (() => {
    const buf = Buffer.alloc(32);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(24, 4);
    buf.write('WEBP', 8);
    buf.write('VP8L', 12);
    buf.writeUInt32LE(10, 16);
    buf.writeUInt8(0x2F, 20);
    const vp8lBits = (256 - 1) | ((128 - 1) << 14);
    buf.writeUInt32LE(vp8lBits, 21);
    return buf;
  })(),

  // WebP VP8X 测试图片 (512x384)
  webpVP8X: (() => {
    const buf = Buffer.alloc(32);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(24, 4);
    buf.write('WEBP', 8);
    buf.write('VP8X', 12);
    buf.writeUInt32LE(10, 16);
    buf.writeUInt8((512 - 1) & 0xFF, 24);
    buf.writeUInt8(((512 - 1) >> 8) & 0xFF, 25);
    buf.writeUInt8(((512 - 1) >> 16) & 0xFF, 26);
    buf.writeUInt8((384 - 1) & 0xFF, 27);
    buf.writeUInt8(((384 - 1) >> 8) & 0xFF, 28);
    buf.writeUInt8(((384 - 1) >> 16) & 0xFF, 29);
    return buf;
  })(),

  // TIFF Little Endian 测试图片
  tiffLE: Buffer.from([
    0x49, 0x49, 0x2A, 0x00, // II + magic
    0x08, 0x00, 0x00, 0x00, // IFD offset = 8
    0x02, 0x00,             // 2 entries
    // Entry 1: ImageWidth = 100
    0x00, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00,
    // Entry 2: ImageHeight = 200
    0x01, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0xC8, 0x00, 0x00, 0x00,
  ]),

  // TIFF Big Endian 测试图片
  tiffBE: Buffer.from([
    0x4D, 0x4D, 0x00, 0x2A, // MM + magic
    0x00, 0x00, 0x00, 0x08, // IFD offset = 8
    0x00, 0x02,             // 2 entries
    // Entry 1: ImageWidth = 100
    0x01, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x64, 0x00, 0x00,
    // Entry 2: ImageHeight = 200
    0x01, 0x01, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0xC8, 0x00, 0x00,
  ]),

  invalid: Buffer.from('This is not an image file'),
  empty: Buffer.alloc(0),
};

describe('napcat-image-size', () => {
  describe('matchMagic', () => {
    it('should match magic bytes at the beginning', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(matchMagic(buffer, [0x89, 0x50, 0x4E, 0x47])).toBe(true);
    });

    it('should match magic bytes at offset', () => {
      const buffer = Buffer.from([0x00, 0x00, 0x89, 0x50, 0x4E, 0x47]);
      expect(matchMagic(buffer, [0x89, 0x50, 0x4E, 0x47], 2)).toBe(true);
    });

    it('should return false for non-matching magic', () => {
      const buffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(matchMagic(buffer, [0x89, 0x50, 0x4E, 0x47])).toBe(false);
    });

    it('should return false for buffer too short', () => {
      const buffer = Buffer.from([0x89, 0x50]);
      expect(matchMagic(buffer, [0x89, 0x50, 0x4E, 0x47])).toBe(false);
    });

    it('should return false for offset beyond buffer', () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
      expect(matchMagic(buffer, [0x89, 0x50], 10)).toBe(false);
    });
  });

  describe('detectImageTypeFromBuffer', () => {
    it('should detect PNG image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.png)).toBe(ImageType.PNG);
    });

    it('should detect JPEG image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.jpeg)).toBe(ImageType.JPEG);
    });

    it('should detect BMP image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.bmp)).toBe(ImageType.BMP);
    });

    it('should detect GIF87a image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.gif87a)).toBe(ImageType.GIF);
    });

    it('should detect GIF89a image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.gif89a)).toBe(ImageType.GIF);
    });

    it('should detect WebP VP8 image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.webpVP8)).toBe(ImageType.WEBP);
    });

    it('should detect WebP VP8L image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.webpVP8L)).toBe(ImageType.WEBP);
    });

    it('should detect WebP VP8X image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.webpVP8X)).toBe(ImageType.WEBP);
    });

    it('should detect TIFF Little Endian image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.tiffLE)).toBe(ImageType.TIFF);
    });

    it('should detect TIFF Big Endian image type', () => {
      expect(detectImageTypeFromBuffer(testBuffers.tiffBE)).toBe(ImageType.TIFF);
    });

    it('should return UNKNOWN for invalid data', () => {
      expect(detectImageTypeFromBuffer(testBuffers.invalid)).toBe(ImageType.UNKNOWN);
    });

    it('should return UNKNOWN for empty buffer', () => {
      expect(detectImageTypeFromBuffer(testBuffers.empty)).toBe(ImageType.UNKNOWN);
    });
  });

  describe('imageSizeFromBuffer', () => {
    it('should parse PNG image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.png)).toEqual({ width: 100, height: 200 });
    });

    it('should parse JPEG image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.jpeg)).toEqual({ width: 320, height: 240 });
    });

    it('should parse BMP image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.bmp)).toEqual({ width: 640, height: 480 });
    });

    it('should parse GIF87a image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.gif87a)).toEqual({ width: 800, height: 600 });
    });

    it('should parse GIF89a image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.gif89a)).toEqual({ width: 1024, height: 768 });
    });

    it('should parse WebP VP8 image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.webpVP8)).toEqual({ width: 1920, height: 1080 });
    });

    it('should parse WebP VP8L image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.webpVP8L)).toEqual({ width: 256, height: 128 });
    });

    it('should parse WebP VP8X image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.webpVP8X)).toEqual({ width: 512, height: 384 });
    });

    it('should parse TIFF Little Endian image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.tiffLE)).toEqual({ width: 100, height: 200 });
    });

    it('should parse TIFF Big Endian image size correctly', async () => {
      expect(await imageSizeFromBuffer(testBuffers.tiffBE)).toEqual({ width: 100, height: 200 });
    });

    it('should return undefined for invalid data', async () => {
      expect(await imageSizeFromBuffer(testBuffers.invalid)).toBeUndefined();
    });

    it('should return undefined for empty buffer', async () => {
      expect(await imageSizeFromBuffer(testBuffers.empty)).toBeUndefined();
    });
  });

  describe('imageSizeFromBufferFallBack', () => {
    it('should return actual size for valid image', async () => {
      expect(await imageSizeFromBufferFallBack(testBuffers.png)).toEqual({ width: 100, height: 200 });
    });

    it('should return default fallback for invalid data', async () => {
      expect(await imageSizeFromBufferFallBack(testBuffers.invalid)).toEqual({ width: 1024, height: 1024 });
    });

    it('should return custom fallback for invalid data', async () => {
      expect(await imageSizeFromBufferFallBack(testBuffers.invalid, { width: 500, height: 300 })).toEqual({ width: 500, height: 300 });
    });

    it('should return default fallback for empty buffer', async () => {
      expect(await imageSizeFromBufferFallBack(testBuffers.empty)).toEqual({ width: 1024, height: 1024 });
    });

    it('should return custom fallback for empty buffer', async () => {
      expect(await imageSizeFromBufferFallBack(testBuffers.empty, { width: 800, height: 600 })).toEqual({ width: 800, height: 600 });
    });
  });

  describe('ImageType enum', () => {
    it('should have correct enum values', () => {
      expect(ImageType.JPEG).toBe('jpeg');
      expect(ImageType.PNG).toBe('png');
      expect(ImageType.BMP).toBe('bmp');
      expect(ImageType.GIF).toBe('gif');
      expect(ImageType.WEBP).toBe('webp');
      expect(ImageType.TIFF).toBe('tiff');
      expect(ImageType.UNKNOWN).toBe('unknown');
    });
  });

  describe('Real image files from resource directory', () => {
    it('should detect and parse test-20x20.jpg', async () => {
      const filePath = path.join(resourceDir, 'test-20x20.jpg');
      const buffer = fs.readFileSync(filePath);
      expect(detectImageTypeFromBuffer(buffer)).toBe(ImageType.JPEG);
      const size = await imageSizeFromBuffer(buffer);
      expect(size).toEqual({ width: 20, height: 20 });
    });

    it('should detect and parse test-20x20.png', async () => {
      const filePath = path.join(resourceDir, 'test-20x20.png');
      const buffer = fs.readFileSync(filePath);
      expect(detectImageTypeFromBuffer(buffer)).toBe(ImageType.PNG);
      const size = await imageSizeFromBuffer(buffer);
      expect(size).toEqual({ width: 20, height: 20 });
    });

    it('should detect and parse test-20x20.tiff', async () => {
      const filePath = path.join(resourceDir, 'test-20x20.tiff');
      const buffer = fs.readFileSync(filePath);
      expect(detectImageTypeFromBuffer(buffer)).toBe(ImageType.TIFF);
      const size = await imageSizeFromBuffer(buffer);
      expect(size).toEqual({ width: 20, height: 20 });
    });

    it('should detect and parse test-20x20.webp', async () => {
      const filePath = path.join(resourceDir, 'test-20x20.webp');
      const buffer = fs.readFileSync(filePath);
      expect(detectImageTypeFromBuffer(buffer)).toBe(ImageType.WEBP);
      const size = await imageSizeFromBuffer(buffer);
      expect(size).toEqual({ width: 20, height: 20 });
    });

    it('should detect and parse test-490x498.gif', async () => {
      const filePath = path.join(resourceDir, 'test-490x498.gif');
      const buffer = fs.readFileSync(filePath);
      expect(detectImageTypeFromBuffer(buffer)).toBe(ImageType.GIF);
      const size = await imageSizeFromBuffer(buffer);
      expect(size).toEqual({ width: 490, height: 498 });
    });

    it('should parse real images using imageSizeFromFile', async () => {
      expect(await imageSizeFromFile(path.join(resourceDir, 'test-20x20.jpg'))).toEqual({ width: 20, height: 20 });
      expect(await imageSizeFromFile(path.join(resourceDir, 'test-20x20.png'))).toEqual({ width: 20, height: 20 });
      expect(await imageSizeFromFile(path.join(resourceDir, 'test-20x20.tiff'))).toEqual({ width: 20, height: 20 });
      expect(await imageSizeFromFile(path.join(resourceDir, 'test-20x20.webp'))).toEqual({ width: 20, height: 20 });
      expect(await imageSizeFromFile(path.join(resourceDir, 'test-490x498.gif'))).toEqual({ width: 490, height: 498 });
    });
  });
});
