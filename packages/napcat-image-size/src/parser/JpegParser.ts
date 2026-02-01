import { ImageParser, ImageType, matchMagic, ImageSize } from '@/napcat-image-size/src';
import { ReadStream } from 'fs';

// JPEG解析器
export class JpegParser implements ImageParser {
  readonly type = ImageType.JPEG;
  // JPEG 魔术头：FF D8
  private readonly JPEG_SIGNATURE = [0xFF, 0xD8];

  // JPEG标记常量
  private readonly SOF_MARKERS = {
    SOF0: 0xC0, // 基线DCT
    SOF1: 0xC1, // 扩展顺序DCT
    SOF2: 0xC2, // 渐进式DCT
    SOF3: 0xC3, // 无损
  } as const;

  // 非SOF标记
  private readonly NON_SOF_MARKERS: number[] = [
    0xC4, // DHT
    0xC8, // JPEG扩展
    0xCC, // DAC
  ] as const;

  canParse (buffer: Buffer): boolean {
    return matchMagic(buffer, this.JPEG_SIGNATURE);
  }

  isSOFMarker (marker: number): boolean {
    return (
      marker === this.SOF_MARKERS.SOF0 ||
      marker === this.SOF_MARKERS.SOF1 ||
      marker === this.SOF_MARKERS.SOF2 ||
      marker === this.SOF_MARKERS.SOF3
    );
  }

  isNonSOFMarker (marker: number): boolean {
    return this.NON_SOF_MARKERS.includes(marker);
  }

  async parseSize (stream: ReadStream): Promise<ImageSize | undefined> {
    return new Promise<ImageSize | undefined>((resolve, reject) => {
      const BUFFER_SIZE = 1024; // 读取块大小，可以根据需要调整
      let buffer = Buffer.alloc(0);
      let offset = 0;
      let found = false;

      // 处理错误
      stream.on('error', (err) => {
        stream.destroy();
        reject(err);
      });

      // 处理数据块
      stream.on('data', (chunk: Buffer | string) => {
        // 追加新数据到缓冲区
        const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        buffer = Buffer.concat([buffer.subarray(offset), chunkBuffer]);
        offset = 0;

        // 保持缓冲区在合理大小内，只保留最后的部分用于跨块匹配
        const bufferSize = buffer.length;
        const MIN_REQUIRED_BYTES = 10; // SOF段最低字节数


        // 从JPEG头部后开始扫描
        while (offset < bufferSize - MIN_REQUIRED_BYTES) {
          // 寻找FF标记
          if (buffer[offset] === 0xFF && buffer[offset + 1]! >= 0xC0 && buffer[offset + 1]! <= 0xCF) {
            const marker = buffer[offset + 1];
            if (!marker) {
              break;
            }
            // 跳过非SOF标记
            if (this.isNonSOFMarker(marker)) {
              offset += 2;
              continue;
            }

            // 处理SOF标记 (包含尺寸信息)
            if (this.isSOFMarker(marker)) {
              // 确保缓冲区中有足够数据读取尺寸
              if (offset + 9 < bufferSize) {
                // 解析尺寸: FF XX YY YY PP HH HH WW WW ...
                // XX = 标记, YY YY = 段长度, PP = 精度, HH HH = 高, WW WW = 宽
                const height = buffer.readUInt16BE(offset + 5);
                const width = buffer.readUInt16BE(offset + 7);

                found = true;
                stream.destroy();
                resolve({ width, height });
                return;
              } else {
                // 如果缓冲区内数据不够，保留当前位置等待更多数据
                break;
              }
            }
          }

          offset++;
        }

        // 缓冲区管理: 如果处理了许多数据但没找到标记，
        // 保留最后N字节用于跨块匹配，丢弃之前的数据
        if (offset > BUFFER_SIZE) {
          const KEEP_BYTES = 20; // 保留足够数据以处理跨块边界的情况
          if (offset > KEEP_BYTES) {
            buffer = buffer.subarray(offset - KEEP_BYTES);
            offset = KEEP_BYTES;
          }
        }
      });

      // 处理流结束
      stream.on('end', () => {
        if (!found) {
          resolve(undefined);
        }
      });
    });
  }
}
