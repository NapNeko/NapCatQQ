import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { JSONSchema } from 'json-schema-to-ts';
import { sleep } from '@/common/utils/helper';

const SchemaData = {
  type: 'object',
  properties: {
    no_cache: { type: 'boolean' },
  }
} as const satisfies JSONSchema;

export class GetOnlineClient extends BaseAction<void, Array<any>> {
  actionName = ActionName.GetOnlineClient;

  protected async _handle(payload: void) {
    //注册监听
    const NTQQSystemApi = this.CoreContext.getApiContext().SystemApi;
    NTQQSystemApi.getOnlineDev();
    await sleep(500);
    
    return [];
  }
}
