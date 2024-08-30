import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '@/onebot';
import { DelGroupFile } from '@/onebot/action/file/DelGroupFile';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        file_id: { type: 'string' },
    },
    required: ['group_id', 'file_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class DeleteGroupFile extends BaseAction<Payload, null> {
    actionName = ActionName.GOCQHTTP_DeleteGroupFile;
    payloadSchema = SchemaData;

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore,
                private ncDelGroupFileImpl: DelGroupFile) {
        super(obContext, core);
    }

    async _handle(payload: Payload) {
        await this.ncDelGroupFileImpl._handle(payload);
        return null;
    }
}
