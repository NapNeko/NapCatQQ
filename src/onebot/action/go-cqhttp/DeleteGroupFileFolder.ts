import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '@/onebot';
import { DelGroupFileFolder } from '@/onebot/action/file/DelGroupFileFolder';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        folder_id: { type: 'string' },
    },
    required: ['group_id', 'folder_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class DeleteGroupFileFolder extends BaseAction<Payload, null> {
    actionName = ActionName.GoCQHTTP_DeleteGroupFileFolder;
    payloadSchema = SchemaData;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore,
                private ncDelGroupFileFolderImpl: DelGroupFileFolder) {
        super(obContext, core);
    }

    async _handle(payload: Payload) {
        await this.ncDelGroupFileFolderImpl._handle(payload);
        return null;
    }
}
