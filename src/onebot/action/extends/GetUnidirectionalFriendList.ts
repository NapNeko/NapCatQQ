import { PacketHexStr } from '@/core/packet/transformer/base';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { ProtoBuf, ProtoBufBase, PBUint32, PBString } from 'napcat.protobuf';

interface Friend {
    uin: number;
    uid: string;
    nick_name: string;
    age: number;
    source: string;
}

interface Block {
    str_uid: string;
    bytes_source: string;
    uint32_sex: number;
    uint32_age: number;
    bytes_nick: string;
    uint64_uin: number;
}

export class GetUnidirectionalFriendList extends OneBotAction<void, Friend[]> {
    override actionName = ActionName.GetUnidirectionalFriendList;

    async pack_data(data: string): Promise<Uint8Array> {
        return ProtoBuf(class extends ProtoBufBase {
            type = PBUint32(2, false, 0);
            data = PBString(3, false, data);
        }).encode();
    }

    async _handle(): Promise<Friend[]> {
        const self_id = this.core.selfInfo.uin;
        const req_json = {
            uint64_uin: self_id,
            uint64_top: 0,
            uint32_req_num: 99,
            bytes_cookies: ""
        };
        const packed_data = await this.pack_data(JSON.stringify(req_json));
        const data = Buffer.from(packed_data).toString('hex');
        const rsq = { cmd: 'MQUpdateSvc_com_qq_ti.web.OidbSvc.0xe17_0', data: data as PacketHexStr };
        const rsp_data = await this.core.apis.PacketApi.pkt.operation.sendPacket(rsq, true);
        const block_json = ProtoBuf(class extends ProtoBufBase { data = PBString(4); }).decode(rsp_data);
        const block_list: Block[] = JSON.parse(block_json.data).rpt_block_list;

        return block_list.map((block) => ({
            uin: block.uint64_uin,
            uid: block.str_uid,
            nick_name: Buffer.from(block.bytes_nick, 'base64').toString(),
            age: block.uint32_age,
            source: Buffer.from(block.bytes_source, 'base64').toString()
        }));
    }
}