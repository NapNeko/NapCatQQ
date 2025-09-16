import { ActionName } from '@/onebot/action/router';
import { OneBotAction, OneBotRequestToolkit } from '@/onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/onebot/config/config';

const SchemaData = Type.Object({

});

type Payload = Static<typeof SchemaData>;

export class TestStreamDownload extends OneBotAction<Payload, string> {
    override actionName = ActionName.TestStreamDownload;
    override payloadSchema = SchemaData;

    async _handle(_payload: Payload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit) {
        for (let i = 0; i < 10; i++) {
            req.send({ index: i });
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return 'done';
    }
}
