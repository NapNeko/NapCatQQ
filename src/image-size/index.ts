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

interface ImageParser {
    readonly type: ImageType;
    canParse(buffer: Buffer): boolean;
    parseSize(stream: ReadStream): Promise<ImageSize | undefined>;
}

// 魔术匹配
function matchMagic(buffer: Buffer, magic: number[], offset = 0): boolean {
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

// PNG解析器
class PngParser implements ImageParser {
    readonly type = ImageType.PNG;
    // PNG 魔术头：89 50 4E 47 0D 0A 1A 0A
    private readonly PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    canParse(buffer: Buffer): boolean {
        return matchMagic(buffer, this.PNG_SIGNATURE);
    }

    async parseSize(stream: ReadStream): Promise<ImageSize | undefined> {
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

// JPEG解析器
class JpegParser implements ImageParser {
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

    canParse(buffer: Buffer): boolean {
        return matchMagic(buffer, this.JPEG_SIGNATURE);
    }

    isSOFMarker(marker: number): boolean {
        return (
            marker === this.SOF_MARKERS.SOF0 ||
            marker === this.SOF_MARKERS.SOF1 ||
            marker === this.SOF_MARKERS.SOF2 ||
            marker === this.SOF_MARKERS.SOF3
        );
    }

    isNonSOFMarker(marker: number): boolean {
        return this.NON_SOF_MARKERS.includes(marker);
    }

    async parseSize(stream: ReadStream): Promise<ImageSize | undefined> {
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

// BMP解析器
class BmpParser implements ImageParser {
    readonly type = ImageType.BMP;
    // BMP 魔术头：42 4D (BM)
    private readonly BMP_SIGNATURE = [0x42, 0x4D];

    canParse(buffer: Buffer): boolean {
        return matchMagic(buffer, this.BMP_SIGNATURE);
    }

    async parseSize(stream: ReadStream): Promise<ImageSize | undefined> {
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

// GIF解析器
class GifParser implements ImageParser {
    readonly type = ImageType.GIF;
    // GIF87a 魔术头：47 49 46 38 37 61
    private readonly GIF87A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
    // GIF89a 魔术头：47 49 46 38 39 61
    private readonly GIF89A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];

    canParse(buffer: Buffer): boolean {
        return (
            matchMagic(buffer, this.GIF87A_SIGNATURE) ||
            matchMagic(buffer, this.GIF89A_SIGNATURE)
        );
    }

    async parseSize(stream: ReadStream): Promise<ImageSize | undefined> {
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

// WEBP解析器 - 完整支持VP8, VP8L, VP8X格式
class WebpParser implements ImageParser {
    readonly type = ImageType.WEBP;
    // WEBP RIFF 头：52 49 46 46 (RIFF)
    private readonly RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
    // WEBP 魔术头：57 45 42 50 (WEBP)
    private readonly WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];

    // WEBP 块头
    private readonly CHUNK_VP8 = [0x56, 0x50, 0x38, 0x20];  // "VP8 "
    private readonly CHUNK_VP8L = [0x56, 0x50, 0x38, 0x4C]; // "VP8L"
    private readonly CHUNK_VP8X = [0x56, 0x50, 0x38, 0x58]; // "VP8X"

    canParse(buffer: Buffer): boolean {
        return (
            buffer.length >= 12 &&
            matchMagic(buffer, this.RIFF_SIGNATURE, 0) &&
            matchMagic(buffer, this.WEBP_SIGNATURE, 8)
        );
    }

    isChunkType(buffer: Buffer, offset: number, chunkType: number[]): boolean {
        return buffer.length >= offset + 4 && matchMagic(buffer, chunkType, offset);
    }

    async parseSize(stream: ReadStream): Promise<ImageSize | undefined> {
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
                        if (!buffer[24] || !buffer[25] || !buffer[26] || !buffer[27] || !buffer[28] || !buffer[29]) {
                            return resolve(undefined);
                        }
                        const width = 1 + ((buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) & 0xFFFFFF);
                        const height = 1 + ((buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) & 0xFFFFFF);
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

const parsers: ReadonlyArray<ImageParser> = [
    new PngParser(),
    new JpegParser(),
    new BmpParser(),
    new GifParser(),
    new WebpParser(),
];

export async function detectImageType(filePath: string): Promise<ImageType> {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath, {
            highWaterMark: 64, // 优化读取buffer大小
            start: 0,
            end: 63
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

export async function imageSizeFromFile(filePath: string): Promise<ImageSize | undefined> {
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

export async function imageSizeFallBack(
    filePath: string,
    fallback: ImageSize = {
        width: 1024,
        height: 1024,
    }
): Promise<ImageSize> {
    return await imageSizeFromFile(filePath) ?? fallback;
}