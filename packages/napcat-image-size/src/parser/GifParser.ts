import { ImageParser, ImageType, matchMagic, ImageSize } from '@/napcat-image-size/src';
import { ReadStream } from 'fs';

// GIF解析器
export class GifParser implements ImageParser {
  readonly type = ImageType.GIF;
  // GIF87a 魔术头：47 49 46 38 37 61
  private readonly GIF87A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
  // GIF89a 魔术头：47 49 46 38 39 61
  private readonly GIF89A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];

  canParse (buffer: Buffer): boolean {
    return (
      matchMagic(buffer, this.GIF87A_SIGNATURE) ||
      matchMagic(buffer, this.GIF89A_SIGNATURE)
    );
  }

  async parseSize (stream: ReadStream): Promise<ImageSize | undefined> {
    return new Promise((resolve, reject) => {
      stream.once('error', reject);
      stream.once('readable', () => {
        const buf = stream.read(10) as Buffer;
        if (!buf || buf.length < 10) {
          return resolve(undefined);
        }
        if (this.canParse(buf)) {
          const width = buf.readUInt16LE(6);
          const height = buf.readUInt16LE(8);
          resolve({ width, height });
        } else {
          resolve(undefined);
        }
      });
    });
  }
}
