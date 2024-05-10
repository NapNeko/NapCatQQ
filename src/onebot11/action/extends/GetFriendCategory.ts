import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { buddyCategory, friends } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { buddyCategorType } from '@/core/entities/';

export class GetFriendCategory extends BaseAction<void, Array<buddyCategorType>> {
    actionName = ActionName.GetFriendCategory;

    protected async _handle(payload: void) {
        return buddyCategory.data;
    }
}
