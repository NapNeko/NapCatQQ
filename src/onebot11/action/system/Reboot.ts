import { rebootWithNormolLogin, rebootWithQuickLogin } from '@/common/utils/reboot';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { selfInfo } from '@/core/data';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    delay: { type: 'number' }
  },
  required: ['delay']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class Reboot extends BaseAction<Payload, null> {
  actionName = ActionName.Reboot;

  protected async _handle(payload: Payload): Promise<null> {
    if (payload.delay) {
      setTimeout(() => {
        rebootWithQuickLogin(selfInfo.uin);
      }, payload.delay);
    } else {
      rebootWithQuickLogin(selfInfo.uin);
    }
    return null;
  }
}
export class RebootNormol extends BaseAction<Payload, null> {
  actionName = ActionName.RebootNormol;

  protected async _handle(payload: Payload): Promise<null> {
    if (payload.delay) {
      setTimeout(() => {
        rebootWithNormolLogin();
      }, payload.delay);
    } else {
      rebootWithNormolLogin();
    }
    return null;
  }
}
