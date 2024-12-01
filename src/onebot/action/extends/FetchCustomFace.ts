import { Type, Static } from '@sinclair/typebox';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

const SchemaData = Type.Object({
    count: Type.Union([Type.Number(), Type.String()], { default: 48 }),
});

type Payload = Static<typeof SchemaData>;

export class FetchCustomFace extends OneBotAction<Payload, string[]> {
    actionName = ActionName.FetchCustomFace;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        //48 可能正好是QQ需要的一个页面的数量 Tagged Mlikiowa
        const ret = await this.core.apis.MsgApi.fetchFavEmojiList(+payload.count);
        return ret.emojiInfoList.map(e => e.url);
    }
}