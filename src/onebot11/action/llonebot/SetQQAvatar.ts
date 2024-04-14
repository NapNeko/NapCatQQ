import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import * as fs from 'node:fs';
import { NTQQUserApi } from '@/core/qqnt/apis/user';
import { checkFileReceived, uri2local } from '../../../common/utils/file';
// import { log } from "../../../common/utils";

interface Payload {
    file: string
}

export default class SetAvatar extends BaseAction<Payload, null> {
  actionName = ActionName.SetQQAvatar;

  protected async _handle(payload: Payload): Promise<null> {
    const { path, isLocal, errMsg } = (await uri2local(payload.file));
    if (errMsg){
      throw `头像${payload.file}设置失败,file字段可能格式不正确`;
    }
    if (path) {
      await checkFileReceived(path, 5000); // 文件不存在QQ会崩溃，需要提前判断
      const ret = await NTQQUserApi.setQQAvatar(path);
      if (!isLocal){
        fs.unlink(path, () => {});
      }
      if (!ret) {
        throw `头像${payload.file}设置失败,api无返回`;
      }
      // log(`头像设置返回：${JSON.stringify(ret)}`)
      if (ret['result'] == 1004022) {
        throw `头像${payload.file}设置失败，文件可能不是图片格式`;
      } else if(ret['result'] != 0) {
        throw `头像${payload.file}设置失败,未知的错误,${ret['result']}:${ret['errMsg']}`;
      }
    } else {
      if (!isLocal){
        fs.unlink(path, () => {});
      }
      throw `头像${payload.file}设置失败,无法获取头像,文件可能不存在`;
    } 
    return null;
  }
}