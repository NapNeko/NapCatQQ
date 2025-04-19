
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    group_name: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupName extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupName;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const ret = await this.core.apis.GroupApi.setGroupName(payload.group_id.toString(), payload.group_name);
        if (ret.result !== 0) {
            throw new Error(`设置群名称失败 ErrCode: ${ret.result} ErrMsg: ${ret.errMsg}`);
        }
        return null;
    }
}
