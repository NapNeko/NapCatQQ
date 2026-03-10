import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from '../example/GoCQHTTPActionsExamples';

export const GoCQHTTPCheckUrlSafelyPayloadSchema = Type.Object({
  url: Type.String({ description: '要检查的 URL' }),
});

export type GoCQHTTPCheckUrlSafelyPayload = Static<typeof GoCQHTTPCheckUrlSafelyPayloadSchema>;

export const GoCQHTTPCheckUrlSafelyReturnSchema = Type.Null({ description: '当前版本未实现该兼容接口' });

export type GoCQHTTPCheckUrlSafelyReturn = Static<typeof GoCQHTTPCheckUrlSafelyReturnSchema>;

export class GoCQHTTPCheckUrlSafely extends OneBotAction<GoCQHTTPCheckUrlSafelyPayload, GoCQHTTPCheckUrlSafelyReturn> {
  override actionName = ActionName.GoCQHTTP_CheckUrlSafely;
  override payloadSchema = GoCQHTTPCheckUrlSafelyPayloadSchema;
  override returnSchema = GoCQHTTPCheckUrlSafelyReturnSchema;
  override actionSummary = '检查URL安全性';
  override actionDescription = '兼容接口，当前版本未实现 check_url_safely';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GoCQHTTPCheckUrlSafely.payload;
  override returnExample = null;

  async _handle (): Promise<null> {
    throw new Error('当前版本未实现 check_url_safely');
  }
}
