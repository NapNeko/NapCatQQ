import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  rawData: Type.String({ description: '原始数据' }),
  brief: Type.String({ description: '简要描述' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '创建结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class CreateCollection extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.CreateCollection;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '创建收藏';
  override actionTags = ['扩展接口'];
  override payloadExample = {
    rawData: '收藏内容',
    brief: '收藏标题'
  };
  override returnExample = {
    result: 0,
    errMsg: ''
  };

  async _handle (payload: PayloadType) {
    return await this.core.apis.CollectionApi.createCollection(
      this.core.selfInfo.uin,
      this.core.selfInfo.uid,
      this.core.selfInfo.nick,
      payload.brief, payload.rawData
    );
  }
}
