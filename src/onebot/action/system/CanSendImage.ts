import { ActionName } from '@/onebot/action/router';
import CanSendRecord, { CanSend } from './CanSendRecord';

interface ReturnType {
    yes: boolean;
}

export default class CanSendImage extends CanSend {
    actionName = ActionName.CanSendImage;
}
