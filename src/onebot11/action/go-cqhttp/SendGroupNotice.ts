import { checkFileReceived, uri2local } from '@/common/utils/file';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQGroupApi, WebApi } from '@/core/apis';
interface Payload {
    group_id: string;
    content: string;
    image?: string;
}
export class SendGroupNotice extends BaseAction<Payload, null> {
    actionName = ActionName.GoCQHTTP_SendGroupNotice;
    protected async _handle(payload: Payload) {
        let UploadImage: { id: string, width: number, height: number } | undefined = undefined;
        if (payload.image) {
            //公告图逻辑
            let Image_path, Image_IsLocal, Image_errMsg;
            let Uri2LocalRet = (await uri2local(payload.image));
            Image_errMsg = Uri2LocalRet.errMsg;
            Image_path = Uri2LocalRet.path;
            Image_IsLocal = Uri2LocalRet.isLocal;
            if (Image_errMsg) {
                throw `群公告${payload.image}设置失败,image字段可能格式不正确`;
            }
            if (!Image_path) {
                throw `群公告${payload.image}设置失败,获取资源失败`;
            }
            await checkFileReceived(Image_path, 5000); // 文件不存在QQ会崩溃，需要提前判断
            let ImageUploadResult = await NTQQGroupApi.uploadGroupBulletinPic(payload.group_id, Image_path);
            if (ImageUploadResult.errCode != 0) {
                throw `群公告${payload.image}设置失败,图片上传失败`;
            }
            UploadImage = ImageUploadResult.picInfo;
        }
        let PublishGroupBulletinResult = await NTQQGroupApi.publishGroupBulletin(payload.group_id, payload.content, UploadImage);
        if(PublishGroupBulletinResult.result ! = 0){
            throw `设置群公告失败,错误信息:${PublishGroupBulletinResult.errMsg}`;
        }
        // 下面实现扬了
        //await WebApi.setGroupNotice(payload.group_id, payload.content);
        return null;
    }
}
