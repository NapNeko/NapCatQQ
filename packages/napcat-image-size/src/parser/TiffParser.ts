import { ImageParser, ImageType, matchMagic, ImageSize } from '@/napcat-image-size/src';
import { ReadStream } from 'fs';

// TIFF解析器
export class TiffParser implements ImageParser {
  readonly type = ImageType.TIFF;
  // TIFF Little Endian 魔术头：49 49 2A 00 (II)
  private readonly TIFF_LE_SIGNATURE = [0x49, 0x49, 0x2A, 0x00];
  // TIFF Big Endian 魔术头：4D 4D 00 2A (MM)
  private readonly TIFF_BE_SIGNATURE = [0x4D, 0x4D, 0x00, 0x2A];

  canParse (buffer: Buffer): boolean {
    return (
      matchMagic(buffer, this.TIFF_LE_SIGNATURE) ||
      matchMagic(buffer, this.TIFF_BE_SIGNATURE)
    );
  }

  async parseSize (stream: ReadStream): Promise<ImageSize | undefined> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let totalBytes = 0;
      const MAX_BYTES = 64 * 1024; // 最多读取 64KB

      stream.on('error', reject);

      stream.on('data', (chunk: Buffer | string) => {
        const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        chunks.push(chunkBuffer);
        totalBytes += chunkBuffer.length;

        if (totalBytes >= MAX_BYTES) {
          stream.destroy();
        }
      });

      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const size = this.parseTiffSize(buffer);
        resolve(size);
      });

      stream.on('close', () => {
        if (chunks.length > 0) {
          const buffer = Buffer.concat(chunks);
          const size = this.parseTiffSize(buffer);
          resolve(size);
        }
      });
    });
  }

  private parseTiffSize (buffer: Buffer): ImageSize | undefined {
    if (buffer.length < 8) {
      return undefined;
    }

    // 判断字节序
    const isLittleEndian = buffer[0] === 0x49; // 'I'

    const readUInt16 = isLittleEndian
      ? (offset: number) => buffer.readUInt16LE(offset)
      : (offset: number) => buffer.readUInt16BE(offset);

    const readUInt32 = isLittleEndian
      ? (offset: number) => buffer.readUInt32LE(offset)
      : (offset: number) => buffer.readUInt32BE(offset);

    // 获取第一个 IFD 的偏移量
    const ifdOffset = readUInt32(4);
    if (ifdOffset + 2 > buffer.length) {
      return undefined;
    }

    // 读取 IFD 条目数量
    const numEntries = readUInt16(ifdOffset);
    let width: number | undefined;
    let height: number | undefined;

    // TIFF 标签
    const TAG_IMAGE_WIDTH = 0x0100;
    const TAG_IMAGE_HEIGHT = 0x0101;

    // 遍历 IFD 条目
    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      if (entryOffset + 12 > buffer.length) {
        break;
      }

      const tag = readUInt16(entryOffset);
      const type = readUInt16(entryOffset + 2);
      // const count = readUInt32(entryOffset + 4);

      // 根据类型读取值
      let value: number;
      if (type === 3) {
        // SHORT (2 bytes)
        value = readUInt16(entryOffset + 8);
      } else if (type === 4) {
        // LONG (4 bytes)
        value = readUInt32(entryOffset + 8);
      } else {
        continue;
      }

      if (tag === TAG_IMAGE_WIDTH) {
        width = value;
      } else if (tag === TAG_IMAGE_HEIGHT) {
        height = value;
      }

      if (width !== undefined && height !== undefined) {
        return { width, height };
      }
    }

    if (width !== undefined && height !== undefined) {
      return { width, height };
    }

    return undefined;
  }
}
