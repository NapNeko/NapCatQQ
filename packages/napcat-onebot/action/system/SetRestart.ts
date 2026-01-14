import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class SetRestart extends OneBotAction<void, void> {
  override actionName = ActionName.Reboot;

  async _handle () {
    setTimeout(() => {
      writeFileSync(join(this.obContext.context.pathWrapper.binaryPath, 'napcat.restart'), Date.now().toString());
      process.exit(51);
    }, 5);
  }
}
