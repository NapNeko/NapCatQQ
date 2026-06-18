import { ImageParser, ImageType, matchMagic, ImageSize } from '@/napcat-image-size/src';
import { ReadStream } from 'fs';

// PNG解析器
export class PngParser implements ImageParser {
  readonly type = ImageType.PNG;
  // PNG 魔术头：89 50 4E 47 0D 0A 1A 0A
  private readonly PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

  canParse (buffer: Buffer): boolean {
    return matchMagic(buffer, this.PNG_SIGNATURE);
  }

  async parseSize (stream: ReadStream): Promise<ImageSize | undefined> {
    return new Promise((resolve, reject) => {
      stream.once('error', reject);
      stream.once('readable', () => {
        const buf = stream.read(24) as Buffer;
        if (!buf || buf.length < 24) {
          return resolve(undefined);
        }
        if (this.canParse(buf)) {
          const width = buf.readUInt32BE(16);
          const height = buf.readUInt32BE(20);
          resolve({ width, height });
        } else {
          resolve(undefined);
        }
      });
    });
  }
}
