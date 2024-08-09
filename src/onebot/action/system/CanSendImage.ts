import { ActionName } from '../types';
import CanSendRecord from './CanSendRecord';

interface ReturnType {
  yes: boolean
}

export default class CanSendImage extends CanSendRecord {
    actionName = ActionName.CanSendImage;
}
