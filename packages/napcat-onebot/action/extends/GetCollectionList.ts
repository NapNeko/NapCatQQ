import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  category: Type.String({ description: '分类ID' }),
  count: Type.String({ default: '1', description: '获取数量' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '收藏列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetCollectionList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetCollectionList;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.CollectionApi.getAllCollection(+payload.category, +payload.count);
  }
}
