import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GoCQHTTPGetModelShowPayloadSchema = Type.Object({
  model: Type.Optional(Type.String({ description: '模型名称' })),
});

export type GoCQHTTPGetModelShowPayload = Static<typeof GoCQHTTPGetModelShowPayloadSchema>;

export const GoCQHTTPGetModelShowReturnSchema = Type.Array(Type.Object({
  variants: Type.Object({
    model_show: Type.String({ description: '显示名称' }),
    need_pay: Type.Boolean({ description: '是否需要付费' }),
  }),
}), { description: '模型显示列表' });

export type GoCQHTTPGetModelShowReturn = Static<typeof GoCQHTTPGetModelShowReturnSchema>;

export class GoCQHTTPGetModelShow extends OneBotAction<GoCQHTTPGetModelShowPayload, GoCQHTTPGetModelShowReturn> {
  override actionName = ActionName.GoCQHTTP_GetModelShow;
  override payloadSchema = GoCQHTTPGetModelShowPayloadSchema;
  override returnSchema = GoCQHTTPGetModelShowReturnSchema;

  async _handle (payload: GoCQHTTPGetModelShowPayload) {
    if (!payload.model) {
      payload.model = 'napcat';
    }
    return [{
      variants: {
        model_show: 'napcat',
        need_pay: false,
      },
    }];
  }
}
