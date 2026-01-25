import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import fs from 'node:fs/promises';
import { checkFileExist, uriToLocalFile } from 'napcat-common/src/file';
import { Static, Type } from '@sinclair/typebox';

import { ExtendsActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  file: Type.String({ description: '图片路径、URL或Base64' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '设置结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetAvatar extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetQQAvatar;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置QQ头像';
  override actionDescription = '修改当前账号的QQ头像';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.SetQQAvatar.payload;
  override returnExample = ExtendsActionsExamples.SetQQAvatar.response;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const { path, success } = (await uriToLocalFile(this.core.NapCatTempPath, payload.file));
    if (!success) {
      throw new Error(`头像${payload.file}设置失败,file字段可能格式不正确`);
    }
    if (path) {
      await checkFileExist(path, 5000);// 避免崩溃
      const ret = await this.core.apis.UserApi.setQQAvatar(path);
      fs.unlink(path).catch(() => { });
      if (!ret) {
        throw new Error(`头像${payload.file}设置失败,api无返回`);
      }
      // log(`头像设置返回：${JSON.stringify(ret)}`)
      if (Number(ret.result) === 1004022) {
        throw new Error(`头像${payload.file}设置失败，文件可能不是图片格式`);
      } else if (ret.result !== 0) {
        throw new Error(`头像${payload.file}设置失败,未知的错误,${ret.result}:${ret.errMsg}`);
      }
    } else {
      fs.unlink(path).catch(() => { });
      throw new Error(`头像${payload.file}设置失败,无法获取头像,文件可能不存在`);
    }
    return null;
  }
}
