import { ActionName } from '@/napcat-onebot/action/router';
import { CanSend } from './CanSendRecord';

export default class CanSendImage extends CanSend {
  override actionName = ActionName.CanSendImage;
}
