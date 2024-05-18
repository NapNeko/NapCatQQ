import { NTQQGroupApi } from '@/core';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQMsgApi } from '@/core/apis/msg';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { uid2UinMap } from '@/core/data';

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: 'number' }
  },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupSystemMsg extends BaseAction<void, any> {
  actionName = ActionName.GetGroupSystemMsg;
  protected async _handle(payload: void) {
    // 默认10条 该api未完整实现 包括响应数据规范化 类型规范化 
    let SingleScreenNotifies = await NTQQGroupApi.getSingleScreenNotifies(10);
    let retData: any = { InvitedRequest: [], join_requests: [] };
    for (const SSNotify of SingleScreenNotifies) {
      if (SSNotify.type == 1) {
        retData.InvitedRequest.push({
          request_id: SSNotify.seq,
          invitor_uin: uid2UinMap[SSNotify.user1?.uid],
          invitor_nick: SSNotify.user1?.nickName,
          group_id: SSNotify.group?.groupCode,
          group_name: SSNotify.group?.groupName,
          checked: SSNotify.status === 1 ? false : true,
          actor: uid2UinMap[SSNotify.user2?.uid] || 0,
        });
      } else if (SSNotify.type == 7) {
        retData.join_requests.push({
          request_id: SSNotify.seq,
          requester_uin: uid2UinMap[SSNotify.user1?.uid],
          requester_nick: SSNotify.user1?.nickName,
          group_id: SSNotify.group?.groupCode,
          group_name: SSNotify.group?.groupName,
          checked: SSNotify.status === 1 ? false : true,
          actor: uid2UinMap[SSNotify.user2?.uid] || 0,
        });
      }
    }

    return retData;
  }
}
