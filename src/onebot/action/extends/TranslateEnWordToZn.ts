import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    words: Type.Array(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class TranslateEnWordToZn extends OneBotAction<Payload, Array<unknown> | null> {
    override actionName = ActionName.TranslateEnWordToZn;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const ret = await this.core.apis.SystemApi.translateEnWordToZn(payload.words);
        if (ret.result !== 0) {
            throw new Error('翻译失败');
        }
        return ret.words;
    }
}
