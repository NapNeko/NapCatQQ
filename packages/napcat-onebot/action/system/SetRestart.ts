import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { WebUiDataRuntime } from 'napcat-webui-backend/src/helper/Data';
import { Type } from '@sinclair/typebox';

export class SetRestart extends OneBotAction<void, void> {
  override actionName = ActionName.Reboot;
  override payloadSchema = Type.Object({});
  override returnSchema = Type.Null();
  override actionDescription = '重启服务';
  override actionTags = ['系统接口'];

  async _handle () {
    const result = await WebUiDataRuntime.requestRestartProcess();
    if (!result.result) {
      throw new Error(result.message || '进程重启失败');
    }
  }
}
