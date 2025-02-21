import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { napCatVersion } from '@/common/version';
interface ResponseType {
    app_name: string;
    protocol_version: string;
    app_version: string;
}
export default class GetVersionInfo extends OneBotAction<void, ResponseType> {
    override actionName = ActionName.GetVersionInfo;

    async _handle(): Promise<ResponseType> {
        return {
            app_name: 'NapCat.Onebot',
            protocol_version: 'v11',
            app_version: napCatVersion,
        };
    }
}
