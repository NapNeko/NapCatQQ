import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    remark: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupRemark extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupRemark;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload): Promise<null> {
        let ret = await this.core.apis.GroupApi.setGroupRemark(payload.group_id, payload.remark);
        if (ret.result != 0) {
            throw new Error(`设置群备注失败, ${ret.result}:${ret.errMsg}`);
        }
        return null;
    }
}
