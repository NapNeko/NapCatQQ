import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { checkFileExistV2, uriToLocalFile } from '@/common/file';
import { Static, Type } from '@sinclair/typebox';
import fs from 'node:fs/promises';
import { GeneralCallResult } from '@/core';
const SchemaData = Type.Object({
    file: Type.String(),
    group_id: Type.Union([Type.Number(), Type.String()])
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupPortrait extends OneBotAction<Payload, GeneralCallResult> {
    override actionName = ActionName.SetGroupPortrait;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<GeneralCallResult> {
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
            if (ret.result as number == 1004022) {
                throw new Error(`头像${payload.file}设置失败，文件可能不是图片格式或权限不足`);
            } else if (ret.result != 0) {
                throw new Error(`头像${payload.file}设置失败,未知的错误,${ret.result}:${ret.errMsg}`);
            }
            return ret;
        } else {
            fs.unlink(path).catch(() => { });
            throw new Error(`头像${payload.file}设置失败,无法获取头像,文件可能不存在`);
        }
    }
}
