import { PacketBuf } from 'napcat-core/packet/transformer/base';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { ProtoBuf, ProtoBufBase, PBUint32, PBString } from 'napcat.protobuf';
import { Type, Static } from '@sinclair/typebox';

const ReturnSchema = Type.Array(
  Type.Object({
    uin: Type.Number({ description: 'QQ号' }),
    uid: Type.String({ description: '用户UID' }),
    nick_name: Type.String({ description: '昵称' }),
    age: Type.Number({ description: '年龄' }),
    source: Type.String({ description: '来源' }),
  }),
  { description: '单向好友列表' }
);

type ReturnType = Static<typeof ReturnSchema>;

export class GetUnidirectionalFriendList extends OneBotAction<void, ReturnType> {
  override actionName = ActionName.GetUnidirectionalFriendList;
  override payloadSchema = Type.Void();
  override returnSchema = ReturnSchema;
  override actionSummary = '获取单向好友列表';
  override actionTags = ['用户扩展'];
  override payloadExample = {};
  override returnExample = [
    {
      uin: 123456789,
      uid: 'u_123',
      nick_name: '单向好友',
      age: 20,
      source: '来源'
    }
  ];

  async pack_data (data: string): Promise<Uint8Array> {
    return ProtoBuf(class extends ProtoBufBase {
      type = PBUint32(2, false, 0);
      data = PBString(3, false, data);
    }).encode();
  }

  async _handle (): Promise<ReturnType> {
    const self_id = this.core.selfInfo.uin;
    const req_json = {
      uint64_uin: self_id,
      uint64_top: 0,
      uint32_req_num: 99,
      bytes_cookies: '',
    };
    const packed_data = await this.pack_data(JSON.stringify(req_json));
    const data = Buffer.from(packed_data);
    const rsq = { cmd: 'MQUpdateSvc_com_qq_ti.web.OidbSvc.0xe17_0', data: data as unknown as PacketBuf };
    const rsp_data = await this.core.apis.PacketApi.pkt.operation.sendPacket(rsq, true);
    const block_json = ProtoBuf(class extends ProtoBufBase { data = PBString(4); }).decode(rsp_data);
    interface BlockItem {
      uint64_uin: number;
      str_uid: string;
      bytes_nick: string;
      uint32_age: number;
      bytes_source: string;
    }
    const block_data: { rpt_block_list: BlockItem[]; } = JSON.parse(block_json.data);
    const block_list = block_data.rpt_block_list;

    return block_list.map((block) => ({
      uin: block.uint64_uin,
      uid: block.str_uid,
      nick_name: Buffer.from(block.bytes_nick, 'base64').toString(),
      age: block.uint32_age,
      source: Buffer.from(block.bytes_source, 'base64').toString(),
    }));
  }
}
