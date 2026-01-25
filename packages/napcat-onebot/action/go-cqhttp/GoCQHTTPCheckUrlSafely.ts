import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

export const GoCQHTTPCheckUrlSafelyPayloadSchema = Type.Object({
  url: Type.String({ description: '要检查的 URL' }),
});

export type GoCQHTTPCheckUrlSafelyPayload = Static<typeof GoCQHTTPCheckUrlSafelyPayloadSchema>;

export const GoCQHTTPCheckUrlSafelyReturnSchema = Type.Object({
  level: Type.Number({ description: '安全等级 (1: 安全, 2: 未知, 3: 危险)' }),
});

export type GoCQHTTPCheckUrlSafelyReturn = Static<typeof GoCQHTTPCheckUrlSafelyReturnSchema>;

export class GoCQHTTPCheckUrlSafely extends OneBotAction<GoCQHTTPCheckUrlSafelyPayload, GoCQHTTPCheckUrlSafelyReturn> {
  override actionName = ActionName.GoCQHTTP_CheckUrlSafely;
  override payloadSchema = GoCQHTTPCheckUrlSafelyPayloadSchema;
  override returnSchema = GoCQHTTPCheckUrlSafelyReturnSchema;
  override actionDescription = '检查 URL 安全性';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GoCQHTTPCheckUrlSafely.payload;

  async _handle () {
    return { level: 1 };
  }
}
