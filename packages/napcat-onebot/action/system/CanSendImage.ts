import { ActionName } from '@/napcat-onebot/action/router';
import { CanSend } from './CanSendRecord';
import { SystemActionsExamples } from './examples';

export default class CanSendImage extends CanSend {
  override actionName = ActionName.CanSendImage;
  override actionDescription = '检查是否可以发送图片';
  override actionTags = ['系统接口'];
  override payloadExample = SystemActionsExamples.CanSendImage.payload;
}
