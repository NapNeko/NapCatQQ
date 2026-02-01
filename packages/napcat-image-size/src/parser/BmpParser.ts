import { ImageParser, ImageType, matchMagic, ImageSize } from '@/napcat-image-size/src';
import { ReadStream } from 'fs';

// BMP解析器
export class BmpParser implements ImageParser {
  readonly type = ImageType.BMP;
  // BMP 魔术头：42 4D (BM)
  private readonly BMP_SIGNATURE = [0x42, 0x4D];

  canParse (buffer: Buffer): boolean {
    return matchMagic(buffer, this.BMP_SIGNATURE);
  }

  async parseSize (stream: ReadStream): Promise<ImageSize | undefined> {
    return new Promise((resolve, reject) => {
      stream.once('error', reject);
      stream.once('readable', () => {
        const buf = stream.read(26) as Buffer;
        if (!buf || buf.length < 26) {
          return resolve(undefined);
        }
        if (this.canParse(buf)) {
          const width = buf.readUInt32LE(18);
          const height = buf.readUInt32LE(22);
          resolve({ width, height });
        } else {
          resolve(undefined);
        }
      });
    });
  }
}
