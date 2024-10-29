import BaseAction from '../BaseAction';
import { ActionName, BaseCheckResult } from '../types';
import * as fs from 'node:fs';
import { checkFileReceived, uri2local } from '@/common/file';

interface Payload {
    file: string,
    group_id: number
}

export default class SetGroupPortrait extends BaseAction<Payload, any> {
    actionName = ActionName.SetGroupPortrait;

    // 用不着复杂检测
    protected async check(payload: Payload): Promise<BaseCheckResult> {
        if (!payload.file || typeof payload.file != 'string' || !payload.group_id || typeof payload.group_id != 'number') {
            return {
                valid: false,
                message: 'file和group_id字段不能为空或者类型错误',
            };
        }
        return {
            valid: true,
        };
    }

    async _handle(payload: Payload): Promise<any> {
        const { path, success } = (await uri2local(this.core.NapCatTempPath, payload.file));
        if (!success) {
            throw `头像${payload.file}设置失败,file字段可能格式不正确`;
        }
        if (path) {
            await checkFileReceived(path, 5000); // 文件不存在QQ会崩溃，需要提前判断
            const ret = await this.core.apis.GroupApi.setGroupAvatar(payload.group_id.toString(), path);
            fs.unlink(path, () => { });
            if (!ret) {
                throw `头像${payload.file}设置失败,api无返回`;
            }
            if (ret.result as number == 1004022) {
                throw `头像${payload.file}设置失败，文件可能不是图片格式或权限不足`;
            } else if (ret.result != 0) {
                throw `头像${payload.file}设置失败,未知的错误,${ret.result}:${ret.errMsg}`;
            }
            return ret;
        } else {
            fs.unlink(path, () => {});
            throw `头像${payload.file}设置失败,无法获取头像,文件可能不存在`;
        }
    }
}
