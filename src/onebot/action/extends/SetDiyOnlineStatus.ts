import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    face_id: z.union([z.number(), z.string()]),// 参考 face_config.json 的 QSid
    face_type: z.union([z.number(), z.string()]).default('1'),
    wording: z.string().default(' '),
});

type Payload = z.infer<typeof SchemaData>;

export class SetDiyOnlineStatus extends OneBotAction<Payload, string> {
    override actionName = ActionName.SetDiyOnlineStatus;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const ret = await this.core.apis.UserApi.setDiySelfOnlineStatus(
            payload.face_id.toString(),
            payload.wording,
            payload.face_type.toString(),
        );
        if (ret.result !== 0) {
            throw new Error('设置在线状态失败');
        }
        return ret.errMsg;
    }
}
