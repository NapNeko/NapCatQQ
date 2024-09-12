import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { ChatType, Peer, SendFileElement } from '@/core/entities';
import fs from 'fs';
import { uri2local } from '@/common/file';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageContext } from '@/onebot/api';
import { ContextMode, createContext } from '../msg/SendMsg';

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
        file: { type: 'string' },
        name: { type: 'string' },
    },
    required: ['user_id', 'file', 'name'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GoCQHTTPUploadPrivateFile extends BaseAction<Payload, null> {
    actionName = ActionName.GOCQHTTP_UploadPrivateFile;
    payloadSchema = SchemaData;

    async getPeer(payload: Payload): Promise<Peer> {
        if (payload.user_id) {
            const peerUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
            if (!peerUid) {
                throw `私聊${payload.user_id}不存在`;
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

        const msgContext: MessageContext = {
            peer: await createContext(this.core, {
                user_id: payload.user_id.toString(),
                group_id: undefined,
            }, ContextMode.Private),
            deleteAfterSentFiles: []
        };
        const sendFileEle: SendFileElement = await this.core.apis.FileApi.createValidSendFileElement(msgContext, downloadResult.path, payload.name);
        await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(await this.getPeer(payload), [sendFileEle], [], true);
        return null;
    }
}
