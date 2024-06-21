import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { BuddyCategoryType } from '@/core/entities/';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { NTQQFriendApi } from '@/core';

const SchemaData = {
  type: 'object',
  properties: {
    no_cache: { type: ['boolean', 'string'] },
  }
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetFriendWithCategory extends BaseAction<Payload, BuddyCategoryType[]> {
  actionName = ActionName.GetFriendsWithCategory;

  protected async _handle(payload: Payload) {
    return await NTQQFriendApi.getFriendsRaw(payload?.no_cache?.toString() === 'true');
  }
}
