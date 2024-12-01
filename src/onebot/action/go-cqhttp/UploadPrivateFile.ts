import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { ChatType, Peer, SendFileElement } from '@/core/types';
import fs from 'fs';
import { uri2local } from '@/common/file';
import { SendMessageContext } from '@/onebot/api';
import { ContextMode, createContext } from '@/onebot/action/msg/SendMsg';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Union([Type.Number(), Type.String()]),
    file: Type.String(),
    name: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export default class GoCQHTTPUploadPrivateFile extends OneBotAction<Payload, null> {
    actionName = ActionName.GOCQHTTP_UploadPrivateFile;
    payloadSchema = SchemaData;

    async getPeer(payload: Payload): Promise<Peer> {
        if (payload.user_id) {
            const peerUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
            if (!peerUid) {
                throw new Error( `私聊${payload.user_id}不存在`);
            }
            const isBuddy = await this.core.apis.FriendApi.isBuddy(peerUid);
            return { chatType: isBuddy ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP, peerUid };
        }
        throw new Error('缺少参数 user_id');
    }

    async _handle(payload: Payload): Promise<null> {
        let file = payload.file;
        if (fs.existsSync(file)) {
            file = `file://${file}`;
        }
        const downloadResult = await uri2local(this.core.NapCatTempPath, file);
        if (!downloadResult.success) {
            throw new Error(downloadResult.errMsg);
        }

        const msgContext: SendMessageContext = {
            peer: await createContext(this.core, {
                user_id: payload.user_id.toString(),
                group_id: undefined,
            }, ContextMode.Private),
            deleteAfterSentFiles: []
        };
        const sendFileEle: SendFileElement = await this.core.apis.FileApi.createValidSendFileElement(msgContext, downloadResult.path, payload.name);
        await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(await this.getPeer(payload), [sendFileEle], msgContext.deleteAfterSentFiles, true);
        return null;
    }
}
