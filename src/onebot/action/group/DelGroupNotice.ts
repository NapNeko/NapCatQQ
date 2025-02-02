import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    notice_id: Type.String()
});

type Payload = Static<typeof SchemaData>;

export class DelGroupNotice extends OneBotAction<Payload, void> {
    override actionName = ActionName.DelGroupNotice;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const group = payload.group_id.toString();
        const noticeId = payload.notice_id;
        return await this.core.apis.GroupApi.deleteGroupBulletin(group, noticeId);
    }
}
