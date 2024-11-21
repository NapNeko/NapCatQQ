import { ActionName } from '@/onebot/action/router';
import CanSendRecord from './CanSendRecord';

interface ReturnType {
    yes: boolean;
}

export default class CanSendImage extends CanSendRecord {
    actionName = ActionName.CanSendImage;
}
