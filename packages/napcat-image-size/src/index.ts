import { BmpParser } from '@/napcat-image-size/src/parser/BmpParser';
import { GifParser } from '@/napcat-image-size/src/parser/GifParser';
import { JpegParser } from '@/napcat-image-size/src/parser/JpegParser';
import { PngParser } from '@/napcat-image-size/src/parser/PngParser';
import { TiffParser } from '@/napcat-image-size/src/parser/TiffParser';
import { WebpParser } from '@/napcat-image-size/src/parser/WebpParser';
import * as fs from 'fs';
import { ReadStream } from 'fs';
import { Readable } from 'stream';

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
  TIFF = 'tiff',
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

// 所有解析器实例
const parserInstances = {
  png: new PngParser(),
  jpeg: new JpegParser(),
  bmp: new BmpParser(),
  gif: new GifParser(),
  webp: new WebpParser(),
  tiff: new TiffParser(),
};

// 首字节到可能的图片类型映射，用于快速筛选
const firstByteMap = new Map<number, ImageType[]>([
  [0x42, [ImageType.BMP]],       // 'B' - BMP
  [0x47, [ImageType.GIF]],       // 'G' - GIF
  [0x49, [ImageType.TIFF]],      // 'I' - TIFF (II - little endian)
  [0x4D, [ImageType.TIFF]],      // 'M' - TIFF (MM - big endian)
  [0x52, [ImageType.WEBP]],      // 'R' - RIFF (WebP)
  [0x89, [ImageType.PNG]],       // PNG signature
  [0xFF, [ImageType.JPEG]],      // JPEG SOI
]);

// 类型到解析器的映射
const typeToParser = new Map<ImageType, ImageParser>([
  [ImageType.PNG, parserInstances.png],
  [ImageType.JPEG, parserInstances.jpeg],
  [ImageType.BMP, parserInstances.bmp],
  [ImageType.GIF, parserInstances.gif],
  [ImageType.WEBP, parserInstances.webp],
  [ImageType.TIFF, parserInstances.tiff],
]);

// 所有解析器列表（用于回退）
const parsers: ReadonlyArray<ImageParser> = Object.values(parserInstances);

export async function detectImageType (filePath: string): Promise<ImageType> {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, {
      highWaterMark: 64, // 优化读取buffer大小
      start: 0,
      end: 63,
    });

    const chunks: Buffer[] = [];

    stream.on('error', (err) => {
      stream.destroy();
      reject(err);
    });

    stream.on('data', (chunk: Buffer | string) => {
      const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(chunkBuffer);
    });

    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);

      if (buffer.length === 0) {
        return resolve(ImageType.UNKNOWN);
      }

      for (const parser of parsers) {
        if (parser.canParse(buffer)) {
          return resolve(parser.type);
        }
      }

      resolve(ImageType.UNKNOWN);
    });
  });
}

export async function imageSizeFromFile (filePath: string): Promise<ImageSize | undefined> {
  try {
    // 先检测类型
    const type = await detectImageType(filePath);
    const parser = typeToParser.get(type);
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

// 从 Buffer 创建可读流
function bufferToReadStream (buffer: Buffer): ReadStream {
  const readable = new Readable({
    read () {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable as unknown as ReadStream;
}

// 从 Buffer 检测图片类型（使用首字节快速筛选）
export function detectImageTypeFromBuffer (buffer: Buffer): ImageType {
  if (buffer.length === 0) {
    return ImageType.UNKNOWN;
  }

  const firstByte = buffer[0]!;
  const possibleTypes = firstByteMap.get(firstByte);

  if (possibleTypes) {
    // 根据首字节快速筛选可能的类型
    for (const type of possibleTypes) {
      const parser = typeToParser.get(type);
      if (parser && parser.canParse(buffer)) {
        return parser.type;
      }
    }
  }

  // 回退：遍历所有解析器
  for (const parser of parsers) {
    if (parser.canParse(buffer)) {
      return parser.type;
    }
  }

  return ImageType.UNKNOWN;
}

// 从 Buffer 解析图片尺寸
export async function imageSizeFromBuffer (buffer: Buffer): Promise<ImageSize | undefined> {
  const type = detectImageTypeFromBuffer(buffer);
  const parser = typeToParser.get(type);
  if (!parser) {
    return undefined;
  }

  try {
    const stream = bufferToReadStream(buffer);
    return await parser.parseSize(stream);
  } catch (err) {
    console.error(`解析图片尺寸出错: ${err}`);
    return undefined;
  }
}

// 从 Buffer 解析图片尺寸，带回退值
export async function imageSizeFromBufferFallBack (
  buffer: Buffer,
  fallback: ImageSize = {
    width: 1024,
    height: 1024,
  }
): Promise<ImageSize> {
  return await imageSizeFromBuffer(buffer) ?? fallback;
}
