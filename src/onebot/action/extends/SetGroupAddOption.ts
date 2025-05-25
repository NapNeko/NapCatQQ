import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    add_type: Type.Number(),
    group_question: Type.Optional(Type.String()),
    group_answer: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupAddOption extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupAddOption;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload): Promise<null> {
        let ret = await this.core.apis.GroupApi.setGroupAddOption(payload.group_id, {
            addOption: payload.add_type,
            groupQuestion: payload.group_question,
            groupAnswer: payload.group_answer,
        });
        if (ret.result != 0) {
            throw new Error(`设置群添加选项失败, ${ret.result}:${ret.errMsg}`);
        }
        return null;
    }
}
