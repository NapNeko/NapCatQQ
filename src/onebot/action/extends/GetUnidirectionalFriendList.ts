import { PacketHexStr } from '@/core/packet/transformer/base';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { ProtoBuf, ProtoBufBase, PBUint32, PBString } from 'napcat.protobuf';

interface Friend {
    Uin: number;
    UID: number;
    Nickname: string;
    Age: number;
    Source: string;
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
        const req_json = JSON.stringify({
            uint64_uin: self_id,
            uint64_top: 0,
            uint32_req_num: 99,
            bytes_cookies: ""
        });
        const packed_data = await this.pack_data(req_json);
        const data = Buffer.from(packed_data).toString('hex');
        const rsq = { cmd: 'MQUpdateSvc_com_qq_ti.web.OidbSvc.0xe17_0', data: data as PacketHexStr };
        const rsp_data = await this.core.apis.PacketApi.pkt.operation.sendPacket(rsq, true);
        const block_json = ProtoBuf(class extends ProtoBufBase { data = PBString(4); }).decode(rsp_data);
        const block_list = JSON.parse(block_json.data).rpt_block_list;

        return block_list.map((block: any) => ({
            Uin: block.Uin,
            UID: block.UID,
            Nickname: Buffer.from(block.NickBytes, 'base64').toString(),
            Age: block.Age,
            Source: Buffer.from(block.SourceBytes, 'base64').toString()
        }));
    }
}