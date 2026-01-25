import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { checkFileExistV2, uriToLocalFile } from 'napcat-common/src/file';
import { Static, Type } from '@sinclair/typebox';
import fs from 'node:fs/promises';
import { GoCQHTTPActionsExamples } from './examples';

export const SetGroupPortraitPayloadSchema = Type.Object({
  file: Type.String({ description: '头像文件路径或 URL' }),
  group_id: Type.String({ description: '群号' }),
});

export type SetGroupPortraitPayload = Static<typeof SetGroupPortraitPayloadSchema>;

const ReturnSchema = Type.Object({
  result: Type.Number(),
  errMsg: Type.String(),
}, { description: '设置结果' });

export type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupPortrait extends OneBotAction<SetGroupPortraitPayload, ReturnType> {
  override actionName = ActionName.SetGroupPortrait;
  override payloadSchema = SetGroupPortraitPayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置群头像';
  override actionDescription = '修改指定群聊的头像';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.SetGroupPortrait.payload;
  override returnExample = GoCQHTTPActionsExamples.SetGroupPortrait.response;

  async _handle (payload: SetGroupPortraitPayload): Promise<ReturnType> {
    const { path, success } = (await uriToLocalFile(this.core.NapCatTempPath, payload.file));
    if (!success) {
      throw new Error(`头像${payload.file}设置失败,file字段可能格式不正确`);
    }
    if (path) {
      await checkFileExistV2(path, 5000); // 文件不存在QQ会崩溃，需要提前判断
      const ret = await this.core.apis.GroupApi.setGroupAvatar(payload.group_id.toString(), path);
      fs.unlink(path).catch(() => { });
      if (!ret) {
        throw new Error(`头像${payload.file}设置失败,api无返回`);
      }
      if (Number(ret.result) === 1004022) {
        throw new Error(`头像${payload.file}设置失败，文件可能不是图片格式或权限不足`);
      } else if (Number(ret.result) !== 0) {
        throw new Error(`头像${payload.file}设置失败,未知的错误,${ret.result}:${ret.errMsg}`);
      }
      return {
        result: Number(ret.result),
        errMsg: ret.errMsg,
      };
    } else {
      fs.unlink(path).catch(() => { });
      throw new Error(`头像${payload.file}设置失败,无法获取头像,文件可能不存在`);
    }
  }
}
