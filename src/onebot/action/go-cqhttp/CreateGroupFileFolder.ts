import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NapCatOneBot11Adapter } from '@/onebot';
import { NapCatCore } from '@/core';
import { SetGroupFileFolder } from '@/onebot/action/file/SetGroupFileFolder';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        folder_name: { type: 'string' },
    },
    required: ['group_id', 'folder_name'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class CreateGroupFileFolder extends BaseAction<Payload, null> {
    actionName = ActionName.GoCQHTTP_CreateGroupFileFolder;
    payloadSchema = SchemaData;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore,
                private ncSetGroupFileFolderImpl: SetGroupFileFolder) {
        super(obContext, core);
    }

    async _handle(payload: Payload) {
        await this.ncSetGroupFileFolderImpl._handle(payload);
        return null;
    }
}
