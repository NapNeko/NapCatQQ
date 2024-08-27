import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { napcat_version } from '@/common/path';

export default class GetVersionInfo extends BaseAction<any, any> {
    actionName = ActionName.GetVersionInfo;

    async _handle(payload: any): Promise<any> {
        return {
            app_name: 'NapCat.Onebot',
            protocol_version: 'v11',
            app_version: napcat_version,
        };
    }
}
