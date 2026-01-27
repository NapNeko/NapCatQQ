import { ActionName } from '@/napcat-onebot/action/router';
import { CanSend } from './CanSendRecord';

export default class CanSendImage extends CanSend {
  override actionName = ActionName.CanSendImage;
  override actionSummary = '是否可以发送图片';
  override actionDescription = '检查是否可以发送图片';
  override actionTags = ['系统接口'];
  override payloadExample = {};
  override returnExample = { yes: true };
}
