import * as proto from '@/napcat-core/packet/transformer/proto';
import { NapProtoEncodeStructType, NapProtoMsg } from 'napcat-protobuf';
import { OidbPacket, PacketTransformer } from '@/napcat-core/packet/transformer/base';
import OidbBase from '@/napcat-core/packet/transformer/oidb/oidbBase';

class DownloadGroupPtt extends PacketTransformer<typeof proto.NTV2RichMediaResp> {
  build (groupUin: number, node: NapProtoEncodeStructType<typeof proto.IndexNode>): OidbPacket {
    const body = new NapProtoMsg(proto.NTV2RichMediaReq).encode({
      reqHead: {
        common: {
          requestId: 4,
          command: 200,
        },
        scene: {
          requestType: 1,
          businessType: 3,
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
    return OidbBase.build(0x126E, 200, body, true, false);
  }

  parse (data: Buffer) {
    const oidbBody = OidbBase.parse(data).body;
    return new NapProtoMsg(proto.NTV2RichMediaResp).decode(oidbBody);
  }
}

export default new DownloadGroupPtt();
