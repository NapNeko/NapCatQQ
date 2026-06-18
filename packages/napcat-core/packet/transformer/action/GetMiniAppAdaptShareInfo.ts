import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoMsg } from 'napcat-protobuf';
import { OidbPacket, PacketBufBuilder, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import { MiniAppReqParams } from '@/napcat-core/packet/entities/miniApp';

class GetMiniAppAdaptShareInfo extends PacketTransformer<typeof proto.MiniAppAdaptShareInfoResp> {
  build (req: MiniAppReqParams): OidbPacket {
    const data = new NapProtoMsg(proto.MiniAppAdaptShareInfoReq).encode({
      appId: req.sdkId,
      body: {
        extInfo: {
          field2: Buffer.alloc(0),
        },
        appid: req.appId,
        title: req.title,
        desc: req.desc,
        time: BigInt(Date.now()),
        scene: req.scene,
        templateType: req.templateType,
        businessType: req.businessType,
        picUrl: req.picUrl,
        vidUrl: '',
        jumpUrl: req.jumpUrl,
        iconUrl: req.iconUrl,
        verType: req.verType,
        shareType: req.shareType,
        versionId: req.versionId,
        withShareTicket: req.withShareTicket,
        webURL: req.webUrl ?? '',
        appidRich: Buffer.alloc(0),
        template: {
          templateId: '',
          templateData: '',
        },
        field20: '',
      },
    });
    return {
      cmd: 'LightAppSvc.mini_app_share.AdaptShareInfo',
      data: PacketBufBuilder(data),
    };
  }

  parse (data: Buffer) {
    return new NapProtoMsg(proto.MiniAppAdaptShareInfoResp).decode(data);
  }
}

export default new GetMiniAppAdaptShareInfo();
