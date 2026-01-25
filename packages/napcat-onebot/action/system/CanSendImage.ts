import { ActionName } from '@/napcat-onebot/action/router';
import { CanSend } from './CanSendRecord';
import { ActionExamples } from '../examples';

export default class CanSendImage extends CanSend {
  override actionName = ActionName.CanSendImage;
  override actionDescription = '检查是否可以发送图片';
  override payloadExample = ActionExamples.CanSendImage.payload;
  override returnExample = ActionExamples.CanSendImage.return;
}
