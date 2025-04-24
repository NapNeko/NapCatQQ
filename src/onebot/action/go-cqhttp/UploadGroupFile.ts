import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { ChatType, Peer } from '@/core/types';
import fs from 'fs';
import { uriToLocalFile } from '@/common/file';
import { SendMessageContext } from '@/onebot/api';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    file: Type.String(),
    name: Type.String(),
    folder: Type.Optional(Type.String()),
    folder_id: Type.Optional(Type.String()),//临时扩展
});

type Payload = Static<typeof SchemaData>;

export default class GoCQHTTPUploadGroupFile extends OneBotAction<Payload, null> {
    override actionName = ActionName.GoCQHTTP_UploadGroupFile;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        let file = payload.file;
        if (fs.existsSync(file)) {
            file = `file://${file}`;
        }
        const downloadResult = await uriToLocalFile(this.core.NapCatTempPath, file);
        const peer: Peer = {
            chatType: ChatType.KCHATTYPEGROUP,
            peerUid: payload.group_id.toString(),
        };
        if (!downloadResult.success) {
            throw new Error(downloadResult.errMsg);
        }
        const msgContext: SendMessageContext = {
            peer: peer,
            deleteAfterSentFiles: []
        };
        const sendFileEle = await this.core.apis.FileApi.createValidSendFileElement(msgContext, downloadResult.path, payload.name, payload.folder ?? payload.folder_id);
        msgContext.deleteAfterSentFiles.push(downloadResult.path);
        await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(peer, [sendFileEle], msgContext.deleteAfterSentFiles);
        return null;
    }
}
