import { ImageParser, ImageType, matchMagic, ImageSize } from '@/napcat-image-size/src';
import { ReadStream } from 'fs';

// WEBP解析器 - 完整支持VP8, VP8L, VP8X格式
export class WebpParser implements ImageParser {
  readonly type = ImageType.WEBP;
  // WEBP RIFF 头：52 49 46 46 (RIFF)
  private readonly RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
  // WEBP 魔术头：57 45 42 50 (WEBP)
  private readonly WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];

  // WEBP 块头
  private readonly CHUNK_VP8 = [0x56, 0x50, 0x38, 0x20]; // "VP8 "
  private readonly CHUNK_VP8L = [0x56, 0x50, 0x38, 0x4C]; // "VP8L"
  private readonly CHUNK_VP8X = [0x56, 0x50, 0x38, 0x58]; // "VP8X"

  canParse (buffer: Buffer): boolean {
    return (
      buffer.length >= 12 &&
      matchMagic(buffer, this.RIFF_SIGNATURE, 0) &&
      matchMagic(buffer, this.WEBP_SIGNATURE, 8)
    );
  }

  isChunkType (buffer: Buffer, offset: number, chunkType: number[]): boolean {
    return buffer.length >= offset + 4 && matchMagic(buffer, chunkType, offset);
  }

  async parseSize (stream: ReadStream): Promise<ImageSize | undefined> {
    return new Promise((resolve, reject) => {
      // 需要读取足够的字节来检测所有三种格式
      const MAX_HEADER_SIZE = 32;
      let totalBytes = 0;
      let buffer = Buffer.alloc(0);

      stream.on('error', reject);

      stream.on('data', (chunk: Buffer | string) => {
        const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        buffer = Buffer.concat([buffer, chunkBuffer]);
        totalBytes += chunk.length;

        // 检查是否有足够的字节进行格式检测
        if (totalBytes >= MAX_HEADER_SIZE) {
          stream.destroy();

          // 检查基本的WEBP签名
          if (!this.canParse(buffer)) {
            return resolve(undefined);
          }

          // 检查chunk头部，位于字节12-15
          if (this.isChunkType(buffer, 12, this.CHUNK_VP8)) {
            // VP8格式 - 标准WebP
            // 宽度和高度在帧头中
            const width = buffer.readUInt16LE(26) & 0x3FFF;
            const height = buffer.readUInt16LE(28) & 0x3FFF;
            return resolve({ width, height });
          } else if (this.isChunkType(buffer, 12, this.CHUNK_VP8L)) {
            // VP8L格式 - 无损WebP
            // 1字节标记后是14位宽度和14位高度
            const bits = buffer.readUInt32LE(21);
            const width = 1 + (bits & 0x3FFF);
            const height = 1 + ((bits >> 14) & 0x3FFF);
            return resolve({ width, height });
          } else if (this.isChunkType(buffer, 12, this.CHUNK_VP8X)) {
            // VP8X格式 - 扩展WebP
            // 24位宽度和高度(减去1)
            if (buffer.length < 30) {
              return resolve(undefined);
            }
            const width = 1 + ((buffer[24]! | (buffer[25]! << 8) | (buffer[26]! << 16)) & 0xFFFFFF);
            const height = 1 + ((buffer[27]! | (buffer[28]! << 8) | (buffer[29]! << 16)) & 0xFFFFFF);
            return resolve({ width, height });
          } else {
            // 未知的WebP子格式
            return resolve(undefined);
          }
        }
      });

      stream.on('end', () => {
        // 如果没有读到足够的字节
        if (totalBytes < MAX_HEADER_SIZE) {
          resolve(undefined);
        }
      });
    });
  }
}
