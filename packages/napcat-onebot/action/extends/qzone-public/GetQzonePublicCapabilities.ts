import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzonePublicAction } from './common';

const PayloadSchema = Type.Object({});
type PayloadType = Static<typeof PayloadSchema>;

export class GetQzonePublicCapabilities extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.GetQzonePublicCapabilities;
  override actionSummary = '获取空友爱看接口能力';
  override actionDescription = '获取当前 QQ 版本和账号可用的空友爱看接口能力，不会执行写操作';
  override payloadSchema = PayloadSchema;
  override payloadExample = {};

  async _handle () {
    return this.core.apis.QzonePublicApi.getCapabilities();
  }
}
