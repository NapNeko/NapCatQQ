import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoEncodeStructType, NapProtoMsg } from 'napcat-protobuf';
import { OidbPacket, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import OidbBase from '@/napcat-core/packet/transformer/oidb/oidbBase';
import { IndexNode } from '@/napcat-core/packet/transformer/proto';

class DownloadGroupVideo extends PacketTransformer<typeof proto.NTV2RichMediaResp> {
  build (groupUin: number, node: NapProtoEncodeStructType<typeof IndexNode>): OidbPacket {
    const body = new NapProtoMsg(proto.NTV2RichMediaReq).encode({
      reqHead: {
        common: {
          requestId: 1,
          command: 200,
        },
        scene: {
          requestType: 2,
          businessType: 2,
          sceneType: 2,
          group: {
            groupUin,
          },
        },
        client: {
          agentType: 2,
        },
      },
      download: {
        node,
        download: {
          video: {
            busiType: 0,
            sceneType: 0,
          },
        },
      },
    });
    return OidbBase.build(0x11EA, 200, body, true, false);
  }

  parse (data: Buffer) {
    const oidbBody = OidbBase.parse(data).body;
    return new NapProtoMsg(proto.NTV2RichMediaResp).decode(oidbBody);
  }
}

export default new DownloadGroupVideo();
