import { BmpParser } from '@/napcat-image-size/src/parser/BmpParser';
import { GifParser } from '@/napcat-image-size/src/parser/GifParser';
import { JpegParser } from '@/napcat-image-size/src/parser/JpegParser';
import { PngParser } from '@/napcat-image-size/src/parser/PngParser';
import { WebpParser } from '@/napcat-image-size/src/parser/WebpParser';
import * as fs from 'fs';
import { ReadStream } from 'fs';

export interface ImageSize {
  width: number;
  height: number;
}

export enum ImageType {
  JPEG = 'jpeg',
  PNG = 'png',
  BMP = 'bmp',
  GIF = 'gif',
  WEBP = 'webp',
  UNKNOWN = 'unknown',
}

export interface ImageParser {
  readonly type: ImageType;
  canParse (buffer: Buffer): boolean;
  parseSize (stream: ReadStream): Promise<ImageSize | undefined>;
}

// 魔术匹配
export function matchMagic (buffer: Buffer, magic: number[], offset = 0): boolean {
  if (buffer.length < offset + magic.length) {
    return false;
  }

  for (let i = 0; i < magic.length; i++) {
    if (buffer[offset + i] !== magic[i]) {
      return false;
    }
  }
  return true;
}

const parsers: ReadonlyArray<ImageParser> = [
  new PngParser(),
  new JpegParser(),
  new BmpParser(),
  new GifParser(),
  new WebpParser(),
];

export async function detectImageType (filePath: string): Promise<ImageType> {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, {
      highWaterMark: 64, // 优化读取buffer大小
      start: 0,
      end: 63,
    });

    let buffer: Buffer | null = null;

    stream.once('error', (err) => {
      stream.destroy();
      reject(err);
    });

    stream.once('readable', () => {
      buffer = stream.read(64) as Buffer;
      stream.destroy();

      if (!buffer) {
        return resolve(ImageType.UNKNOWN);
      }

      for (const parser of parsers) {
        if (parser.canParse(buffer)) {
          return resolve(parser.type);
        }
      }

      resolve(ImageType.UNKNOWN);
    });

    stream.once('end', () => {
      if (!buffer) {
        resolve(ImageType.UNKNOWN);
      }
    });
  });
}

export async function imageSizeFromFile (filePath: string): Promise<ImageSize | undefined> {
  try {
    // 先检测类型
    const type = await detectImageType(filePath);
    const parser = parsers.find(p => p.type === type);
    if (!parser) {
      return undefined;
    }

    // 用流式方式解析尺寸
    const stream = fs.createReadStream(filePath);
    try {
      return await parser.parseSize(stream);
    } catch (err) {
      console.error(`解析图片尺寸出错: ${err}`);
      return undefined;
    } finally {
      if (!stream.destroyed) {
        stream.destroy();
      }
    }
  } catch (err) {
    console.error(`检测图片类型出错: ${err}`);
    return undefined;
  }
}

export async function imageSizeFallBack (
  filePath: string,
  fallback: ImageSize = {
    width: 1024,
    height: 1024,
  }
): Promise<ImageSize> {
  return await imageSizeFromFile(filePath) ?? fallback;
}
