import { describe, expect, it, vi } from 'vitest';
import { NapProtoDecodeStructType, NapProtoEncodeStructType, NapProtoMsg } from 'napcat-protobuf';
import { ElementType, NTVideoType } from '@/napcat-core/types/msg';
import { SendVideoElement } from '@/napcat-core/types/element';
import {
  PacketMsgPicElement,
  PacketMsgVideoElement,
} from '@/napcat-core/packet/message/element';
import { PacketMsgConverter } from '@/napcat-core/packet/message/converter';
import { assertUploadResults } from '@/napcat-core/packet/context/uploadResult';
import { Elem, MsgInfo, VideoFile } from '@/napcat-core/packet/transformer/proto';
import { NTV2RichMediaReq } from '@/napcat-core/packet/transformer/proto/oidb/common/Ntv2.RichMediaReq';
import UploadGroupVideo from '@/napcat-core/packet/transformer/highway/UploadGroupVideo';
import OidbBase from '@/napcat-core/packet/transformer/oidb/oidbBase';
import {
  calculateVideoThumbnailDimensions,
  VIDEO_THUMBNAIL_MAX_BYTES,
  VIDEO_THUMBNAIL_MAX_SIDE,
} from '@/napcat-core/helper/ffmpeg/ffmpeg-exec-adapter';

function createVideoMsgInfo (): NapProtoEncodeStructType<typeof MsgInfo> {
  return {
    msgInfoBody: [
      {
        index: {
          info: {
            fileSize: 1024,
            fileHash: '00112233445566778899aabbccddeeff',
            fileSha1: '00112233445566778899aabbccddeeff00112233',
            fileName: 'clip.mp4',
            type: {
              type: 2,
              videoFormat: NTVideoType.VIDEO_FORMAT_MP4,
            },
            width: 1920,
            height: 1080,
            time: 12,
          },
          fileUuid: 'video-uuid',
        },
      },
      {
        index: {
          info: {
            fileSize: 2048,
            fileHash: 'ffeeddccbbaa99887766554433221100',
            fileSha1: 'ffeeddccbbaa99887766554433221100ffeeddcc',
            fileName: 'thumb.jpg',
            type: {
              type: 1,
              picFormat: 0,
            },
            width: 640,
            height: 360,
          },
          fileUuid: 'thumb-uuid',
        },
      },
    ],
  };
}

function createCompatVideoFile () {
  const codec = new NapProtoMsg(VideoFile);
  return codec.decode(codec.encode({
    fileUuid: 'video-uuid',
    fileMd5: Buffer.from('00112233445566778899aabbccddeeff', 'hex'),
    fileName: 'clip.mp4',
    fileFormat: NTVideoType.VIDEO_FORMAT_MP4,
    fileTime: 12,
    fileSize: 1024,
    thumbWidth: 640,
    thumbHeight: 360,
    thumbFileMd5: Buffer.from('ffeeddccbbaa99887766554433221100', 'hex'),
    thumbFileSize: 2048,
    busiType: 0,
    fromChatType: 1,
    toChatType: 1,
  }));
}

function createSendVideoElement (): SendVideoElement {
  return {
    elementType: ElementType.VIDEO,
    elementId: '',
    videoElement: {
      filePath: 'clip.mp4',
      fileName: 'clip.mp4',
      videoMd5: '00112233445566778899aabbccddeeff',
      thumbMd5: 'ffeeddccbbaa99887766554433221100',
      fileTime: 12,
      fileFormat: NTVideoType.VIDEO_FORMAT_MP4,
      fileSize: '1024',
      fileWidth: 1920,
      fileHeight: 1080,
      thumbWidth: 640,
      thumbHeight: 360,
      thumbSize: 2048,
      thumbPath: new Map([[0, 'thumb.jpg']]),
    },
  };
}

function decodeElem (
  elem: NapProtoEncodeStructType<typeof Elem>
): NapProtoDecodeStructType<typeof Elem> {
  const codec = new NapProtoMsg(Elem);
  return codec.decode(codec.encode(elem));
}

function createCommonVideoElem (businessType: 11 | 21): NapProtoDecodeStructType<typeof Elem> {
  return decodeElem({
    commonElem: {
      serviceType: 48,
      businessType,
      pbElem: new NapProtoMsg(MsgInfo).encode(createVideoMsgInfo()),
    },
  });
}

describe('packet video forwarding', () => {
  it('emits compat VideoFile before the common rich-media element', () => {
    const video = new PacketMsgVideoElement(createSendVideoElement());
    video.msgInfo = createVideoMsgInfo();
    video.compatVideoFile = createCompatVideoFile();
    video.businessType = 11;

    const elems = video.buildElement();

    expect(elems).toHaveLength(2);
    expect(elems[0]?.videoFile?.fileUuid).toBe('video-uuid');
    expect(elems[1]?.commonElem?.serviceType).toBe(48);
    expect(elems[1]?.commonElem?.businessType).toBe(11);
    expect(video.valid).toBe(true);
  });

  it('parses common business type 11/21 as video instead of image', () => {
    for (const businessType of [11, 21] as const) {
      const commonElem = createCommonVideoElem(businessType);
      expect(PacketMsgPicElement.parseElement(commonElem)).toBeUndefined();

      const parsed = new PacketMsgConverter().packetMsgToRaw([
        decodeElem({ videoFile: createCompatVideoFile() }),
        commonElem,
      ]);

      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.[0].elementType).toBe(ElementType.VIDEO);
      expect(parsed[0]?.[0].picElement).toBeUndefined();
      expect(parsed[0]?.[0].videoElement).toMatchObject({
        fileName: 'clip.mp4',
        fileTime: 12,
        fileWidth: 1920,
        fileHeight: 1080,
        thumbWidth: 640,
        thumbHeight: 360,
        fileUuid: 'video-uuid',
      });
    }
  });

  it('preserves video metadata in the rich-media upload request', () => {
    const video = new PacketMsgVideoElement(createSendVideoElement());
    video.fileSha1 = '00112233445566778899aabbccddeeff00112233';
    video.thumbSha1 = 'ffeeddccbbaa99887766554433221100ffeeddcc';

    const packet = UploadGroupVideo.build(123456, video);
    const envelope = OidbBase.parse(packet.data);
    const request = new NapProtoMsg(NTV2RichMediaReq).decode(envelope.body);
    const videoInfo = request.upload?.uploadInfo[0]?.fileInfo;
    const thumbInfo = request.upload?.uploadInfo[1]?.fileInfo;

    expect(videoInfo).toMatchObject({
      fileName: 'clip.mp4',
      fileSize: 1024,
      width: 1920,
      height: 1080,
      time: 12,
    });
    expect(videoInfo?.type.videoFormat).toBe(NTVideoType.VIDEO_FORMAT_MP4);
    expect(thumbInfo?.fileName).toBe('ffeeddccbbaa99887766554433221100.jpg');
  });

  it('propagates resource upload failures instead of silently continuing', () => {
    const uploadError = new Error('thumb upload failed');
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
    };

    expect(() => assertUploadResults([
      { status: 'fulfilled', value: undefined },
      { status: 'rejected', reason: uploadError },
    ], logger)).toThrow('上传转发消息资源失败');
    expect(logger.warn).toHaveBeenCalledWith('上传资源2个，失败1个');
    expect(logger.error).toHaveBeenCalledOnce();
  });
});

describe('video thumbnail constraints', () => {
  it('keeps the longest side bounded without upscaling normal dimensions', () => {
    expect(calculateVideoThumbnailDimensions(1920, 3414)).toEqual({
      width: 404,
      height: VIDEO_THUMBNAIL_MAX_SIDE,
    });
    expect(calculateVideoThumbnailDimensions(640, 360)).toEqual({
      width: 640,
      height: 360,
    });
    expect(VIDEO_THUMBNAIL_MAX_BYTES).toBe(384 * 1024);
  });
});
