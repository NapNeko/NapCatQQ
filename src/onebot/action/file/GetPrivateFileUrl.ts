import { ActionName } from '@/onebot/action/router';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    file_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

interface GetPrivateFileUrlResponse {
    url?: string;
}

export class GetPrivateFileUrl extends GetPacketStatusDepends<Payload, GetPrivateFileUrlResponse> {
    override actionName = ActionName.NapCat_GetPrivateFileUrl;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id);

        if (contextMsgFile?.fileUUID && contextMsgFile.msgId) {
            let msg = await this.core.apis.MsgApi.getMsgsByMsgId(contextMsgFile.peer, [contextMsgFile.msgId]);
            let self_id = this.core.selfInfo.uid;
            let file_hash = msg.msgList[0]?.elements.map(ele => ele.fileElement?.file10MMd5)[0];
            if (file_hash) {
                return {
                    url: await this.core.apis.PacketApi.pkt.operation.GetPrivateFileUrl(self_id, contextMsgFile.fileUUID, file_hash)
                };
            }

        }
        throw new Error('real fileUUID not found!');
    }
}
