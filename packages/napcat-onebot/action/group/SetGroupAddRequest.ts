import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { GroupNotify, NTGroupRequestOperateTypes } from 'napcat-core/types';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from '../example/GroupActionsExamples';

const PayloadSchema = Type.Object({
  flag: Type.String({ description: '请求flag' }),
  approve: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否同意' })),
  reason: Type.Optional(Type.Union([Type.String({ default: ' ' }), Type.Null()], { description: '拒绝理由' })),
  count: Type.Optional(Type.Number({ default: 100, description: '搜索通知数量' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupAddRequest extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupAddRequest;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '处理加群请求';
  override actionDescription = '同意或拒绝加群请求或邀请';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SetGroupAddRequest.payload;
  override returnExample = GroupActionsExamples.SetGroupAddRequest.response;

  async _handle (payload: PayloadType): Promise<null> {
    const flag = payload.flag.toString();
    const approve = payload.approve?.toString() !== 'false';
    const reason = payload.reason ?? ' ';
    const count = payload.count;
    const invite_notify = this.obContext.apis.MsgApi.notifyGroupInvite.get(flag);
    const { doubt, notify } = invite_notify
      ? {
        doubt: false,
        notify: invite_notify,
      }
      : await this.findNotify(flag, count);
    if (!notify) {
      throw new Error('No such request');
    }
    await this.core.apis.GroupApi.handleGroupRequest(
      doubt,
      notify,
      approve ? NTGroupRequestOperateTypes.KAGREE : NTGroupRequestOperateTypes.KREFUSE,
      reason
    );
    return null;
  }

  private async findNotify (flag: string, count: number = 100): Promise<{
    doubt: boolean,
    notify: GroupNotify | undefined;
  }> {
    let notify = (await this.core.apis.GroupApi.getSingleScreenNotifies(false, count)).find(e => e.seq === flag);
    if (!notify) {
      notify = (await this.core.apis.GroupApi.getSingleScreenNotifies(true, count)).find(e => e.seq === flag);
      return { doubt: true, notify };
    }
    return { doubt: false, notify };
  }
}
