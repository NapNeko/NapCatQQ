import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    robot_member_switch: Type.Optional(Type.Number()),
    robot_member_examine: Type.Optional(Type.Number()),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupRobotAddOption extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupRobotAddOption;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload): Promise<null> {
        let ret = await this.core.apis.GroupApi.setGroupRobotAddOption(
            payload.group_id,
            payload.robot_member_switch,
            payload.robot_member_examine,
        );
        if (ret.result != 0) {
            throw new Error(`设置群机器人添加选项失败, ${ret.result}:${ret.errMsg}`);
        }
        return null;
    }
}
