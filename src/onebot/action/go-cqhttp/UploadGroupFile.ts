import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { ChatType, Peer } from '@/core/types';
import fs from 'fs';
import { uriToLocalFile } from '@/common/file';
import { SendMessageContext } from '@/onebot/api';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.coerce.number(), z.coerce.string()]),
    file: z.coerce.string(),
    name: z.coerce.string(),
    folder: z.coerce.string().optional(),
    folder_id: z.coerce.string().optional(),//临时扩展
});

type Payload = z.infer<typeof SchemaData>;

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
        await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(peer, [sendFileEle], msgContext.deleteAfterSentFiles);
        return null;
    }
}
