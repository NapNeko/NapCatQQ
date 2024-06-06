import { DeviceList } from '@/onebot11/main';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { JSONSchema } from 'json-schema-to-ts';
import { NTQQSystemApi } from '@/core';

const SchemaData = {
  type: 'object',
  properties: {
    no_cache: { type: 'boolean' },
  }
} as const satisfies JSONSchema;

export class GetOnlineClient extends BaseAction<void, Array<any>> {
  actionName = ActionName.GetOnlineClient;

  protected async _handle(payload: void) {
    //console.log(await NTQQSystemApi.getOnlineDev());
    return DeviceList;
  }
}
