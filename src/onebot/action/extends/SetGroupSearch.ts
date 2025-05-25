import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    no_code_finger_open: Type.Optional(Type.Number()),
    no_finger_open: Type.Optional(Type.Number()),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupSearch extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupSearch;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload): Promise<null> {
        let ret = await this.core.apis.GroupApi.setGroupSearch(payload.group_id, {
            noCodeFingerOpenFlag: payload.no_code_finger_open,
            noFingerOpenFlag: payload.no_finger_open,
        });
        if (ret.result != 0) {
            throw new Error(`设置群搜索失败, ${ret.result}:${ret.errMsg}`);
        }
        return null;
    }
}
