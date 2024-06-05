import { OB11Message } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { dbUtil } from '@/common/utils/db';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';


export type ReturnDataType = OB11Message

const SchemaData = {
  type: 'object',
  properties: {
    message_id: { type: ['number','string'] },
  },
  required: ['message_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetMsg extends BaseAction<Payload, OB11Message> {
  actionName = ActionName.GetMsg;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    // log("history msg ids", Object.keys(msgHistory));
    if (!payload.message_id) {
      throw Error('参数message_id不能为空');
    }
    let msg = await dbUtil.getMsgByShortId(parseInt(payload.message_id.toString()));
    if (!msg) {
      msg = await dbUtil.getMsgByLongId(payload.message_id.toString());
    }
    if (!msg) {
      throw ('消息不存在');
    }
    return await OB11Constructor.message(msg);
  }
}

export default GetMsg;
