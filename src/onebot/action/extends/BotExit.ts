import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '../OneBotAction';

export class BotExit extends OneBotAction<void, void> {
    override actionName = ActionName.Exit;

    async _handle() {
        process.exit(0);
    }
}
