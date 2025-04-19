import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import fs from 'node:fs/promises';
import { checkFileExist, uriToLocalFile } from '@/common/file';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    file: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export default class SetAvatar extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetQQAvatar;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload): Promise<null> {
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
            if (ret.result as number == 1004022) {
                throw new Error(`头像${payload.file}设置失败，文件可能不是图片格式`);
            } else if (ret.result != 0) {
                throw new Error(`头像${payload.file}设置失败,未知的错误,${ret.result}:${ret.errMsg}`);
            }
        } else {
            fs.unlink(path).catch(() => { });
            throw new Error(`头像${payload.file}设置失败,无法获取头像,文件可能不存在`);
        }
        return null;
    }
}
