import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { OneBotFileApi } from '@/napcat-onebot/api/file';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';
import { NTVideoType } from '@/napcat-core/types/msg';

const MP4_HEADER = Buffer.from([
  0x00, 0x00, 0x00, 0x18,
  0x66, 0x74, 0x79, 0x70,
  0x69, 0x73, 0x6f, 0x6d,
  0x00, 0x00, 0x00, 0x00,
  0x69, 0x73, 0x6f, 0x6d,
]);
const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

describe('OneBot video send modes', () => {
  let tempDir: string;
  let sourceVideoPath: string;
  let uploadedVideoPath: string;
  let fileApi: OneBotFileApi;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), 'napcat-video-send-mode-'));
    sourceVideoPath = path.join(tempDir, 'clip.mp4');
    uploadedVideoPath = path.join(tempDir, 'cache', 'Ori', 'clip.mp4');
    await mkdir(path.dirname(uploadedVideoPath), { recursive: true });
    await Promise.all([
      writeFile(sourceVideoPath, MP4_HEADER),
      writeFile(uploadedVideoPath, MP4_HEADER),
    ]);

    const core = {
      NapCatTempPath: tempDir,
      context: {
        logger: {
          logError: vi.fn(),
        },
      },
      apis: {
        FileApi: {
          uploadFile: vi.fn().mockResolvedValue({
            fileName: 'clip.mp4',
            path: uploadedVideoPath,
            fileSize: MP4_HEADER.length,
            md5: '00112233445566778899aabbccddeeff',
          }),
          copyFile: vi.fn(),
        },
      },
    } as unknown as ConstructorParameters<typeof OneBotFileApi>[1];

    fileApi = new OneBotFileApi(
      {} as ConstructorParameters<typeof OneBotFileApi>[0],
      core
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('uses a PNG thumbnail and legacy minimal metadata for direct kernel sends', async () => {
    const getVideoInfo = vi.spyOn(FFmpegService, 'getVideoInfo').mockResolvedValue({
      width: 480,
      height: 852,
      time: 3.6,
      format: 'jpg',
      size: MP4_HEADER.length,
      filePath: sourceVideoPath,
    });
    const extractLegacyThumbnail = vi
      .spyOn(FFmpegService, 'extractLegacyVideoThumbnail')
      .mockImplementation(async (_videoPath, thumbnailPath) => {
        await writeFile(thumbnailPath, PNG_HEADER);
      });

    const context = {
      deleteAfterSentFiles: [],
      peer: {},
    } as unknown as Parameters<OneBotFileApi['createValidSendVideoElement']>[0];
    const element = await fileApi.createValidSendVideoElement(context, sourceVideoPath);
    const thumbnailPath = element.videoElement.thumbPath?.get(0) as string;

    expect(getVideoInfo).toHaveBeenCalledWith(sourceVideoPath, '');
    expect(extractLegacyThumbnail).toHaveBeenCalledWith(sourceVideoPath, thumbnailPath);
    expect(path.extname(thumbnailPath)).toBe('.png');
    expect((await readFile(thumbnailPath)).subarray(0, PNG_HEADER.length)).toEqual(PNG_HEADER);
    expect(element.videoElement.fileTime).toBe(3.6);
    expect('fileFormat' in element.videoElement).toBe(false);
    expect('fileWidth' in element.videoElement).toBe(false);
    expect('fileHeight' in element.videoElement).toBe(false);
  });

  it('keeps JPEG thumbnails and complete metadata for packet forward uploads', async () => {
    const getVideoInfo = vi
      .spyOn(FFmpegService, 'getVideoInfo')
      .mockImplementation(async (videoPath, thumbnailPath) => {
        await writeFile(thumbnailPath, JPEG_HEADER);
        return {
          width: 480,
          height: 852,
          time: 3.6,
          format: 'jpg',
          size: MP4_HEADER.length,
          filePath: videoPath,
        };
      });
    const extractLegacyThumbnail = vi.spyOn(FFmpegService, 'extractLegacyVideoThumbnail');

    const context = {
      deleteAfterSentFiles: [],
      peer: {},
      usePacketVideoMetadata: true,
    } as unknown as Parameters<OneBotFileApi['createValidSendVideoElement']>[0];
    const element = await fileApi.createValidSendVideoElement(context, sourceVideoPath);
    const thumbnailPath = element.videoElement.thumbPath?.get(0) as string;

    expect(getVideoInfo).toHaveBeenCalledWith(sourceVideoPath, thumbnailPath);
    expect(extractLegacyThumbnail).not.toHaveBeenCalled();
    expect(path.extname(thumbnailPath)).toBe('.jpg');
    expect((await readFile(thumbnailPath)).subarray(0, JPEG_HEADER.length)).toEqual(JPEG_HEADER);
    expect(element.videoElement.fileTime).toBe(4);
    expect(element.videoElement.fileFormat).toBe(NTVideoType.VIDEO_FORMAT_MP4);
    expect(element.videoElement.fileWidth).toBe(480);
    expect(element.videoElement.fileHeight).toBe(852);
  });
});
