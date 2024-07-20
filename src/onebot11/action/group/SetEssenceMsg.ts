import { dbUtil } from '@/common/utils/db';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { NTQQGroupApi, NTQQMsgApi } from '@/core';

const SchemaData = {
  type: 'object',
  properties: {
    message_id: { type: ['number', 'string'] }
  },
  required: ['message_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetEssenceMsg extends BaseAction<Payload, any> {
  actionName = ActionName.SetEssenceMsg;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<any> {
    const msg = await dbUtil.getMsgByShortId(parseInt(payload.message_id.toString()));
    if (!msg) {
      throw new Error('msg not found');
    }
    return await NTQQGroupApi.addGroupEssence(
        msg.peerUin,
        msg.msgId
    );
  }
}
